import { TwitterApi, ETwitterStreamEvent } from 'twitter-api-v2';
import { handleTweet } from './tweetHandler';

export async function startMentionStream(): Promise<void> {
  const bearerToken = process.env.X_BEARER_TOKEN;
  const appUsername = process.env.X_APP_USERNAME;
  if (!bearerToken || !appUsername) {
    console.log('X stream disabled: missing X_BEARER_TOKEN or X_APP_USERNAME');
    return;
  }

  const appUser = appUsername.replace(/^@/, '').toLowerCase();
  const client = new TwitterApi(bearerToken);

  // Create or update rules to capture mentions of the bot
  const rule = `@${appUser}`;
  try {
    const rules = await client.v2.streamRules();
    const existing = rules.data || [];
    const toDelete = existing.map((r) => r.id);
    if (toDelete.length) {
      await client.v2.updateStreamRules({ delete: { ids: toDelete } });
    }
    await client.v2.updateStreamRules({ add: [{ value: rule, tag: 'mentions' }] });
  } catch (e) {
    console.warn('Failed to set stream rules, continuing:', e);
  }

  const stream = await client.v2.searchStream({ "tweet.fields": ["author_id", "in_reply_to_user_id", "created_at"] });
  stream.on(ETwitterStreamEvent.Connected, () => console.log('X stream connected.'));
  stream.on(ETwitterStreamEvent.ConnectionError, (err) => console.error('X stream error', err));
  stream.on(ETwitterStreamEvent.Data, async (evt) => {
    try {
      await handleTweet(evt as any);
    } catch (e) {
      console.error('handleTweet error', e);
    }
  });
}


