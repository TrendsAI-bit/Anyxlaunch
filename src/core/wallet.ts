// Minimal deeplink builder placeholder. In a production setup, you'd craft a
// serialized transaction and embed it in a wallet adapter deep link.

type BuildLinkInput = {
  txRequestUrl: string;
};

export function buildDeeplink(input: BuildLinkInput): string {
  // For now, return the request URL directly. Replace with Phantom/Backpack links
  // like: https://phantom.app/ul/browse/{encoded}?s={tx}
  return input.txRequestUrl;
}


