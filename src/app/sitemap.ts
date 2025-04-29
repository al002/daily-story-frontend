import { Story } from '@/lib/types';
import { MetadataRoute } from 'next';

async function getAllStoryDates() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${apiUrl}/stories`);
  const data = await res.json();
  return data.stories.map((story: Story) => story.date);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const storyDates = await getAllStoryDates();
  
  const stories = storyDates.map((date: string) => ({
    url: `https://dailythriller.com/story/${date}`,
    lastModified: new Date(date),
    changeFrequency: 'never' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://dailythriller.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://dailythriller.com/stories',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...stories,
  ];
}