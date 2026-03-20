/**
 * @fileOverview Reusable image constants for consistent branding and fallbacks.
 */

import data from '@/app/lib/placeholder-images.json';

const getImageUrl = (id: string) => {
  return data.placeholderImages.find(img => img.id === id)?.imageUrl || '';
};

export const HERO_IMAGE = getImageUrl('hero-education');
export const DEFAULT_COURSE_IMAGE = getImageUrl('default-course');
export const DEFAULT_COMMUNITY_IMAGE = getImageUrl('default-community');
export const DEFAULT_CODING_IMAGE = getImageUrl('coding-workspace');
