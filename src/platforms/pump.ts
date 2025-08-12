type CreateInput = { name: string; symbol: string; imageUrl?: string; description?: string };

export async function createOnPump(input: CreateInput): Promise<string | undefined> {
  const apiBase = process.env.PUMPPORTAL_BASE || 'https://pumpportal.fun';
  // TODO: call real Token Creation endpoint or build transaction via IDL
  const params = new URLSearchParams({
    name: input.name,
    symbol: input.symbol,
  });
  const fakeUrl = `${apiBase}/simulate-launch?${params.toString()}`;
  return fakeUrl;
}


