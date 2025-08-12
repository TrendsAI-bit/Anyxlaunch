import { TwitterApi } from 'twitter-api-v2';

export async function reply(inReplyToTweetId: string, text: string): Promise<void> {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.log('REPLY (no keys):', text);
    return;
  }

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  });

  await client.v2.tweet({
    text,
    reply: { in_reply_to_tweet_id: inReplyToTweetId },
  });
}


