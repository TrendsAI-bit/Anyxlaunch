type CreateInput = { name: string; symbol: string; imageUrl?: string; description?: string };

export async function createOnBonk(input: CreateInput): Promise<string | undefined> {
  const base = process.env.BONK_MCP_BASE_URL;
  if (!base) {
    console.warn('LetsBonk: missing BONK_MCP_BASE_URL');
    return undefined;
  }
  const params = new URLSearchParams({ name: input.name, symbol: input.symbol });
  return `${base.replace(/\/$/, '')}/simulate-launch?${params.toString()}`;
}


