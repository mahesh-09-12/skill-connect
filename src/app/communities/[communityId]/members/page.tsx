import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, ShieldCheck, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default async function CommunityMembersPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { name: true, id: true },
  });

  if (!community) {
    notFound();
  }

  const members = await prisma.communityMember.findMany({
    where: { communityId: communityId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/communities/${communityId}`}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Community Feed
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {community.name} Members
            </h1>
            <p className="text-muted-foreground">
              Meet the {members.length} members contributing to this community.
            </p>
          </div>
        </div>
      </div>

      {members.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="p-12 text-center text-muted-foreground">
            No members found in this community yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/5">
                      <AvatarImage src={`https://picsum.photos/seed/${member.user.id}/100/100`} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {member.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base leading-none">{member.user.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={member.role === 'ADMIN' ? 'default' : 'secondary'} 
                          className="text-[10px] h-5 font-bold tracking-tight"
                        >
                          {member.role === 'ADMIN' ? (
                            <ShieldCheck className="mr-1 h-3 w-3" />
                          ) : (
                            <User className="mr-1 h-3 w-3" />
                          )}
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>Member since</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {format(new Date(member.joinedAt), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}