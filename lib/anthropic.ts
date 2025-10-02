import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

export const anthropic = apiKey ? new Anthropic({ apiKey }) : null;
export const isAnthropicAvailable = () => anthropic !== null;

export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL ?? 'claude-3-5-sonnet-20240620';

export async function testAnthropicConnection(): Promise<boolean> {
  if (!anthropic) return false;
  try {
    const r = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }],
    });
    return Boolean(r);
  } catch (e) {
    console.error('Anthropic test failed:', e);
    return false;
  }
}
