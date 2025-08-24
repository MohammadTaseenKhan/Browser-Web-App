// api/proxy.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).send("Missing url parameter");
    }

    // Fetch the target site
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      },
    });

    // Clone headers except frame-blockers
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

    // Pipe response
    res.writeHead(response.status, headers);
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
