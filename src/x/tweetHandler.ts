import { routeCommand } from '../core/orchestrator';

export async function handleTweet(evt: any): Promise<void> {
  const data = evt?.data;
  if (!data?.text || !data?.id) return;

  const text: string = data.text.trim();
  const lower = text.toLowerCase();
  // Basic guard: only process if contains the word "launch"
  if (!lower.includes('launch')) return;

  await routeCommand({
    tweetId: data.id,
    text,
    authorId: data.author_id,
    raw: evt,
  });
}


