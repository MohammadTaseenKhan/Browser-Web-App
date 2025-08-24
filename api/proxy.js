// api/proxy.js

export const config = {
  runtime: "nodejs", // force Node.js runtime
};

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("Missing url parameter");
    }

    const targetUrl = decodeURIComponent(url);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          req.headers["user-agent"] ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Range: req.headers.range || undefined, // support video/audio
      },
    });

    // Copy headers (remove frame-blockers)
    response.headers.forEach((value, key) => {
      if (
        !["content-security-policy", "x-frame-options"].includes(
          key.toLowerCase()
        )
      ) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);

    // Convert Web ReadableStream → Node.js stream
    if (response.body) {
      const reader = response.body.getReader();
      const encoder = new TextEncoder();

      async function push() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      }

      push();
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
