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
export type Community = Prisma.CommunityGetPayload<{
  include: {
    discussions: {
      include: {
        author: true,
        comments: true
      }
    }
  }
}>;
export type Discussion = Prisma.DiscussionGetPayload<{
  include: {
    author: true,
    comments: {
      include: {
        user: true,
        replies: {
          include: {
            user: true
          }
        }
      }
    },
    _count: {
      select: { comments: true, likes: true }
    }
  }
}>;

export type Comment = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: { id: true, name: true }
    },
    replies: {
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    }
  }
}>;