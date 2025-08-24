// api/proxy.js

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("Missing url parameter");
    }

    // Fetch with Node 18 native fetch
    const response = await fetch(url, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      },
    });

    let contentType = response.headers.get("content-type") || "";

    // Copy headers, strip iframe blockers
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

    // Text content (HTML/CSS/JS)
    if (contentType.includes("text/html")) {
      let text = await response.text();

      // Fix relative URLs (basic replacement)
      const baseUrl = new URL(url);
      text = text.replace(
        / (src|href)=["'](\/[^"']*)["']/g,
        (match, attr, path) => {
          return ` ${attr}="${baseUrl.origin}${path}"`;
        }
      );

      res.writeHead(response.status, {
        ...headers,
        "content-type": "text/html; charset=utf-8",
      });
      return res.end(text);
    }

    // Binary (images, videos, etc.)
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.writeHead(response.status, headers);
    res.end(buffer);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
