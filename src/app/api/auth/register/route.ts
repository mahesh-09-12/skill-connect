import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Role, TransactionType } from '@prisma/client';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).optional(),
});

/**
 * @fileOverview Handles user registration and ensures atomic balance + transaction creation.
 * Uses Prisma $transaction to guarantee that both user and welcome bonus are created or neither.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initialCoins = 100;

    const user = await prisma.$transaction(async (tx) => {
      // 1. Create the user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || Role.LEARNER,
          coinBalance: initialCoins,
        },
      });

      // 2. Create the initial transaction record
      // Validation: Type 'SIGNUP_BONUS' is strictly enforced by PostgreSQL Enum
      await tx.coinTransaction.create({
        data: {
          userId: newUser.id,
          amount: initialCoins,
          type: TransactionType.SIGNUP_BONUS,
          reason: 'Welcome Bonus',
        },
      });

      return newUser;
    });

    return NextResponse.json({ 
      message: 'User created successfully', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
