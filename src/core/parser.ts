export type ParsedCommand = {
  name: string;
  symbol: string;
  platform: 'bags' | 'pumpfun' | 'moonit' | 'letsbonk';
  imageUrl?: string;
  description?: string;
};

// Example input:
// "@YourBot launch name=Flube symbol=FLUBE @pumpfun"
export function parseCommand(text: string): ParsedCommand | null {
  const lower = text.toLowerCase();
  if (!lower.includes('launch')) return null;

  const nameMatch = text.match(/name=([^\s]+)/i);
  const symbolMatch = text.match(/symbol=([^\s]+)/i);
  const imgMatch = text.match(/image=(https?:[^\s]+)/i);
  const descMatch = text.match(/desc=([^]+)$/i); // everything after desc=

  const platform = lower.includes('@bags')
    ? 'bags'
    : lower.includes('@pumpfun')
    ? 'pumpfun'
    : lower.includes('@letsbonk')
    ? 'letsbonk'
    : lower.includes('@moonit')
    ? 'moonit'
    : undefined;

  if (!nameMatch || !symbolMatch || !platform) return null;

  return {
    name: nameMatch[1],
    symbol: symbolMatch[1],
    platform,
    imageUrl: imgMatch?.[1],
    description: descMatch?.[1]?.trim(),
  } as any;
}


