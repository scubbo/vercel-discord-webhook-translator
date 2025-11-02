import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

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

function verifySignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const rawBodyBuffer = Buffer.from(body, "utf8");
  const bodySignature = crypto
    .createHmac("sha1", secret)
    .update(rawBodyBuffer)
    .digest("hex");
  if (bodySignature !== signature) {
    const message = "Unauthorized";
    console.log(message);
    console.log("Invalid signature");
    return false;
  } else {
    return true;
  }
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

  if (!receivedSignature || typeof receivedSignature !== "string") {
    const message = "Unauthorized";
    console.log(message);
    console.log("No signature received");
    res.status(401).json({ error: message });
    return;
  }

  const rawBody = JSON.stringify(req.body);

  if (!verifySignature(rawBody, receivedSignature, secret)) {
    const message = "Unauthorized";
    console.log(message);
    console.log(`Signature verification failed`);
    res.status(401).json({ error: message });
    return;
  }

  const payload = req.body as VercelWebhookPayload;

  const commitMessage = payload.payload.deployment.meta.githubCommitMessage;
  const metadata = payload.payload.deployment.meta as unknown as { githubOrg: string; githubRepo: string; githubCommitSha: string };
  const commitLink = `https://github.com/${metadata.githubOrg}/${metadata.githubRepo}/commit/${metadata.githubCommitSha}`;
  // const deploymentUrl = payload.payload.url;
  // Hard-code to the main URL because general users don't have access past Deployment Protection - _could_ turn it off,
  // but :shrug:
  const deploymentUrl = "https://edh-elo-nextjs.vercel.app";

  const discordPayload: DiscordWebhookPayload = {
    content: `Deployment succeeded! Commit message: \`${commitMessage}\`. See the commit [here](${commitLink}) and the site [here](${deploymentUrl}/).`,
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
