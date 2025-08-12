import { parseCommand } from './parser';
import { reply } from './reply';
import { buildDeeplink } from './wallet';
import { createOnBags } from '../platforms/bags';
import { createOnPump } from '../platforms/pump';
import { createOnBonk } from '../platforms/bonk';
import { createOnMoonit } from '../platforms/moonit';

type RouteInput = { tweetId: string; text: string; authorId?: string; raw?: any };

export async function routeCommand(input: RouteInput): Promise<void> {
  const parsed = parseCommand(input.text);
  if (!parsed) {
    return;
  }

  const { name, symbol, platform, imageUrl, description } = parsed;

  try {
    let txRequestUrl: string | undefined;
    switch (platform) {
      case 'bags':
        txRequestUrl = await createOnBags({ name, symbol, imageUrl, description });
        break;
      case 'pumpfun':
        txRequestUrl = await createOnPump({ name, symbol, imageUrl, description });
        break;
      case 'letsbonk':
        txRequestUrl = await createOnBonk({ name, symbol, imageUrl, description });
        break;
      case 'moonit':
        txRequestUrl = await createOnMoonit({ name, symbol, imageUrl, description });
        break;
      default:
        await reply(input.tweetId, `Unrecognized platform. Use @bags @pumpfun @moonit @letsbonk`);
        return;
    }

    if (!txRequestUrl) {
      await reply(input.tweetId, `Failed to prepare launch. Please try another platform.`);
      return;
    }

    const deeplink = buildDeeplink({ txRequestUrl });
    await reply(input.tweetId, `Sign to launch: ${deeplink}`);
  } catch (e: any) {
    await reply(input.tweetId, `Error: ${e?.message || 'Something went wrong.'}`);
  }
}


