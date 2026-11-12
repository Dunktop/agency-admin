const API_ROOT = "https://www.googleapis.com/youtube/v3";

export class YouTubeError extends Error {}

const fail = (message) => {
  throw new YouTubeError(message);
};

const call = async (path, params) => {
  const url = new URL(`${API_ROOT}/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = payload?.error?.errors?.[0]?.reason || "";
    const message = String(payload?.error?.message || "");

    if (reason === "quotaExceeded" || /quota/i.test(message)) {
      fail("Today's YouTube API quota is used up. Try again tomorrow, or add the numbers manually.");
    }
    if (reason === "keyInvalid" || reason === "keyExpired" || /API key not valid/i.test(message)) {
      fail("YouTube rejected that API key. Replace it in the API key panel.");
    }
    if (reason === "accessNotConfigured" || /has not been used in project|is disabled/i.test(message)) {
      fail("The YouTube Data API v3 isn't enabled on that Google Cloud project. Enable it, wait a minute, then retry.");
    }
    if (reason === "ipRefererBlocked" || /referer|restricted/i.test(message)) {
      fail("That key is limited to websites or IPs. Use a key with no application restrictions.");
    }
    fail(message ? `YouTube returned an error: ${message}` : "YouTube couldn't answer that request.");
  }

  return payload;
};

export const parseChannelInput = (raw) => {
  const input = String(raw || "").trim();
  if (!input) return null;
  if (/^UC[\w-]{20,24}$/.test(input)) return { channelId: input };

  const fromUrl = input.match(/(?:youtube\.com|youtu\.be)\/+(.+)$/i);
  const path = (fromUrl ? fromUrl[1] : input).replace(/[?#].*$/, "").replace(/^\/+|\/+$/g, "");
  if (!path) return null;
  const rest = path.replace(/\/(videos|shorts|streams|featured|about|playlists|community)\/?$/i, "");

  const idSegment = rest.match(/^channel\/([\w-]+)$/i);
  if (idSegment) return { channelId: idSegment[1] };

  const handleSegment = rest.match(/^@([^/]+)$/);
  if (handleSegment) return { handle: handleSegment[1] };

  const userSegment = rest.match(/^user\/([^/]+)$/i);
  if (userSegment) return { username: userSegment[1] };

  const customSegment = rest.match(/^c\/([^/]+)$/i);
  if (customSegment) return { handle: customSegment[1] };

  if (fromUrl) return { handle: rest };
  return { handle: input };
};

const fetchChannel = async (apiKey, params) => {
  const payload = await call("channels", {
    key: apiKey,
    part: "snippet,statistics,contentDetails",
    ...params,
  });
  return payload?.items?.[0] || null;
};

const mapChannel = (channel) => ({
  id: channel.id,
  title: String(channel.snippet?.title || "").trim(),
  handle: String(channel.snippet?.customUrl || "").trim(),
  thumbnail:
    channel.snippet?.thumbnails?.high?.url ||
    channel.snippet?.thumbnails?.medium?.url ||
    channel.snippet?.thumbnails?.default?.url ||
    "",
  views: Number(channel.statistics?.viewCount) || 0,
  subscribers: Number(channel.statistics?.subscriberCount) || 0,
  videoCount: Number(channel.statistics?.videoCount) || 0,
  uploads: channel.contentDetails?.relatedPlaylists?.uploads || "",
});

export const verifyKey = async (apiKey) => {
  await fetchChannel(apiKey, { forHandle: "@YouTube" });
  return true;
};

export const resolveChannel = async (apiKey, rawInput) => {
  const parsed = parseChannelInput(rawInput);
  if (!parsed) fail("Paste a channel URL or channel ID first.");

  if (parsed.channelId) {
    const channel = await fetchChannel(apiKey, { id: parsed.channelId });
    if (channel) return mapChannel(channel);
  }

  if (parsed.username) {
    const channel = await fetchChannel(apiKey, { forUsername: parsed.username }).catch(() => null);
    if (channel) return mapChannel(channel);
  }

  if (parsed.handle) {
    const byHandle = await fetchChannel(apiKey, { forHandle: `@${parsed.handle}` }).catch(() => null);
    if (byHandle) return mapChannel(byHandle);

    const byUsername = await fetchChannel(apiKey, { forUsername: parsed.handle }).catch(() => null);
    if (byUsername) return mapChannel(byUsername);

    const search = await call("search", {
      key: apiKey,
      part: "snippet",
      type: "channel",
      maxResults: 1,
      q: parsed.handle,
    });
    const foundId = search?.items?.[0]?.id?.channelId || search?.items?.[0]?.snippet?.channelId;
    if (foundId) {
      const channel = await fetchChannel(apiKey, { id: foundId });
      if (channel) return mapChannel(channel);
    }
  }

  fail("Couldn't find that channel. Check the link, or paste the channel ID that starts with UC.");
};

export const fetchRecentVideos = async (apiKey, uploadsPlaylistId, max = 25) => {
  if (!uploadsPlaylistId) return [];

  const playlist = await call("playlistItems", {
    key: apiKey,
    part: "contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: max,
  });

  const ids = (playlist?.items || []).map((item) => item.contentDetails?.videoId).filter(Boolean);
  if (!ids.length) return [];

  const videos = await call("videos", {
    key: apiKey,
    part: "snippet,statistics",
    id: ids.join(","),
    maxResults: ids.length,
  });

  return (videos?.items || []).map((video) => ({
    id: video.id,
    title: String(video.snippet?.title || "").trim(),
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnail:
      video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || "",
    publishedAt: String(video.snippet?.publishedAt || "").slice(0, 10),
    views: Number(video.statistics?.viewCount) || 0,
  }));
};