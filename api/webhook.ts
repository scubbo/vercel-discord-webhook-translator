import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { VercelWebhookPayload, DiscordWebhookPayload } from './types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.SECRET;
  const targetUrl = process.env.TARGET_URL;

  if (!secret || !targetUrl) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const receivedSignature = req.headers['x-vercel-signature'];

  if (!receivedSignature || receivedSignature !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const payload = req.body as VercelWebhookPayload;

  const commitMessage = payload.payload.deployment.meta.githubCommitMessage;
  const deploymentUrl = payload.payload.url;

  const discordPayload: DiscordWebhookPayload = {
    content: `Deployment succeeded! Commit message: \`${commitMessage}\`. Check it out [here](https://${deploymentUrl}/).`
  };

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discordPayload)
    });

    if (!response.ok) {
      throw new Error(`Target URL responded with status: ${response.status}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error forwarding webhook:', error);
    res.status(500).json({ error: 'Failed to forward webhook' });
  }
}
