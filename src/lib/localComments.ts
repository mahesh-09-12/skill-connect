/**
 * @fileOverview Utility for managing comments in localStorage with 24-hour expiry.
 */

export interface LocalComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: number;
  replies: LocalComment[];
}

/**
 * Retrieves valid (non-expired) comments for a specific discussion.
 * @param discussionId The ID of the discussion.
 * @returns An array of comments that are less than 24 hours old.
 */
export const getComments = (discussionId: string): LocalComment[] => {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(`comments_${discussionId}`);
  if (!data) return [];

  try {
    const parsed: LocalComment[] = JSON.parse(data);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    // Filter out expired comments (older than 24h)
    const valid = parsed.filter(
      (c) => now - c.createdAt < TWENTY_FOUR_HOURS
    );

    // If some were removed, update storage to clean up
    if (valid.length !== parsed.length) {
      localStorage.setItem(`comments_${discussionId}`, JSON.stringify(valid));
    }

    return valid;
  } catch (error) {
    console.error("Failed to parse local comments:", error);
    return [];
  }
};

/**
 * Adds a new comment or reply to localStorage.
 * @param discussionId The ID of the discussion.
 * @param comment The comment object to add.
 * @param parentId Optional ID of the parent comment if this is a reply.
 * @returns The updated list of comments.
 */
export const addComment = (
  discussionId: string,
  comment: LocalComment,
  parentId?: string
): LocalComment[] => {
  if (typeof window === 'undefined') return [];

  const existing = getComments(discussionId);
  let updated: LocalComment[];

  if (parentId) {
    // Handle nested reply
    updated = existing.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), comment] };
      }
      return c;
    });
  } else {
    // Handle top-level comment
    updated = [comment, ...existing];
  }

  localStorage.setItem(`comments_${discussionId}`, JSON.stringify(updated));
  return updated;
};
