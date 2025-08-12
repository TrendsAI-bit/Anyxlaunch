type CreateInput = { name: string; symbol: string; imageUrl?: string; description?: string };

export async function createOnBags(input: CreateInput): Promise<string | undefined> {
  const apiBase = process.env.BAGS_API_BASE || 'https://public-api-v2.bags.fm/api/v1';
  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    console.warn('BAGS: missing BAGS_API_KEY');
    return undefined;
  }

  // Placeholder: in real integration, create metadata, request launch tx
  // and return a deeplink or a link to your signer page.
  const params = new URLSearchParams({
    name: input.name,
    symbol: input.symbol,
  });
  const fakeUrl = `${apiBase}/simulate-launch?${params.toString()}`;
  return fakeUrl;
}


