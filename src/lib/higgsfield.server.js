import { secrets } from "base44:runtime";

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

const credentials = () => {
  const keyId = secrets.get("HIGGSFIELD_API_KEY");
  const secret = secrets.get("HIGGSFIELD_API_SECRET");
  if (!keyId || !secret) return null;
  return { keyId, secret };
};

export const higgsfieldConfigured = () => Boolean(credentials());

const authorization = ({ keyId, secret }) => `Key ${keyId}:${secret}`;

export async function submitThumbnailGeneration({ prompt }) {
  const creds = credentials();
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

export async function fetchGenerationStatus({ requestId }) {
  const creds = credentials();
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