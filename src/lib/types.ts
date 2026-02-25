import { Prisma } from '@prisma/client';

export type User = Prisma.UserGetPayload<{}>;
export type Course = Prisma.CourseGetPayload<{
  include: {
    instructor: true,
    modules: {
      include: {
        lessons: true
      }
    }
  }
}>;
export type Community = Prisma.CommunityGetPayload<{}>;
export type Post = Prisma.PostGetPayload<{
  include: {
    author: true
  }
}>;
