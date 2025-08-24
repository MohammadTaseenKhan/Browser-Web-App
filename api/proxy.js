// api/proxy.js

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("Missing url parameter");
    }

    // Fetch target site using native fetch (Node 18+)
    const response = await fetch(url, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      },
    });

    // Copy headers, removing frame-blockers
    const headers = {};
    response.headers.forEach((value, key) => {
      if (
        !["content-security-policy", "x-frame-options"].includes(
          key.toLowerCase()
        )
      ) {
        headers[key] = value;
      }
    });

    // Convert to buffer before sending
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.writeHead(response.status, headers);
    res.end(buffer);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
