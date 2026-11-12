import { secrets } from "base44:runtime";
import { readIntegrationFields } from "@/lib/integration-store.server";

const API_BASE = "https://api.higgsfield.ai";

/*
 * Platform docs list the endpoint shape for every published model, but the
 * nano-banana-pro entry is only visible in the console catalogue, so the
 * documented path shapes are tried in order and the first accepted one wins.
 */
const MODEL_ENDPOINTS = [
  "google/nano-banana-pro/text-to-image",
  "google/nano-banana-pro",
  "nano-banana-pro",
];

// Keys saved in Settings → Integrations win; the platform secrets stay as a fallback.
export async function higgsfieldCredentials(base44) {
  const fields = base44 ? await readIntegrationFields(base44, "higgsfield") : {};
  const keyId = fields.apiKey || secrets.get("HIGGSFIELD_API_KEY") || "";
  const secret = fields.apiSecret || secrets.get("HIGGSFIELD_API_SECRET") || "";
  if (!keyId || !secret) return null;
  return { keyId, secret };
}

export async function higgsfieldConfigured(base44) {
  return Boolean(await higgsfieldCredentials(base44));
}

const authorization = ({ keyId, secret }) => `Key ${keyId}:${secret}`;

export async function verifyHiggsfieldCredentials({ apiKey, apiSecret }) {
  const response = await fetch(`${API_BASE}/requests/00000000/status`, {
    headers: { Authorization: authorization({ keyId: apiKey, secret: apiSecret }) },
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error("Higgsfield rejected that key and secret.");
  }
  return true;
}

export async function submitThumbnailGeneration({ prompt, base44 }) {
  const creds = await higgsfieldCredentials(base44);
  if (!creds) throw new Error("Higgsfield is not connected yet.");

  const body = JSON.stringify({ prompt, aspect_ratio: "16:9", resolution: "4K" });
  let lastStatus = 0;

  for (const endpoint of MODEL_ENDPOINTS) {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { Authorization: authorization(creds), "Content-Type": "application/json" },
      body,
    });

    if (response.ok) {
      const data = await response.json();
      if (!data?.request_id) throw new Error("Higgsfield did not return a request id.");
      return { requestId: String(data.request_id) };
    }

    lastStatus = response.status;
    if (response.status !== 404) {
      const detail = await response.text();
      throw new Error(`Higgsfield ${response.status}: ${detail.slice(0, 200)}`);
    }
  }

  throw new Error(`Higgsfield image endpoint not found (${lastStatus}).`);
}

export async function fetchGenerationStatus({ requestId, base44 }) {
  const creds = await higgsfieldCredentials(base44);
  if (!creds) throw new Error("Higgsfield is not connected yet.");

  const response = await fetch(`${API_BASE}/requests/${encodeURIComponent(requestId)}/status`, {
    headers: { Authorization: authorization(creds) },
  });
  if (!response.ok) throw new Error(`Higgsfield status ${response.status}`);

  const data = await response.json();
  const image = Array.isArray(data?.images) ? data.images[0] : null;

  return {
    status: String(data?.status || ""),
    imageUrl: image?.url ? String(image.url) : "",
    error: data?.error ? String(data.error).slice(0, 280) : "",
  };
}