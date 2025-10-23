import { VercelRequest, VercelResponse } from "@vercel/node";

interface VercelWebhookPayload {
  payload: {
    deployment: {
      meta: {
        githubCommitMessage: string;
      };
    };
    url: string;
  };
}

interface DiscordWebhookPayload {
  content: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    const message = "Method not allowed";
    console.log(message);
    res.status(405).json({ error: message });
    return;
  }

  const secret = process.env.SECRET;
  const targetUrl = process.env.TARGET_URL;

  if (!secret || !targetUrl) {
    const message = "Server configuration error";
    console.log(message);
    res.status(500).json({ error: message });
    return;
  }

  const receivedSignature = req.headers["x-vercel-signature"];

  if (!receivedSignature || receivedSignature !== secret) {
    const message = "Unauthorized";
    console.log(message);
    // This isn't _terribly_ secure, but it's good enough for a simple webhook translator.
    if (receivedSignature) {
      console.log(`Received incorrect signature ${receivedSignature}`);
    } else {
      console.log("No signature received");
    }
    res.status(401).json({ error: message });
    return;
  }

  const payload = req.body as VercelWebhookPayload;

  const commitMessage = payload.payload.deployment.meta.githubCommitMessage;
  const deploymentUrl = payload.payload.url;

  const discordPayload: DiscordWebhookPayload = {
    content: `Deployment succeeded! Commit message: \`${commitMessage}\`. Check it out [here](https://${deploymentUrl}/).`,
  };

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Target URL responded with status: ${response.status}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error forwarding webhook:", error);
    res.status(500).json({ error: "Failed to forward webhook" });
  }
}
