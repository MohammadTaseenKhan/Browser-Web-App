import zlib from "zlib";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("Missing url parameter");

    const targetUrl = decodeURIComponent(url);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          req.headers["user-agent"] ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    // Copy headers except frame-blockers and content-encoding
    response.headers.forEach((value, key) => {
      if (!["content-security-policy", "x-frame-options", "content-encoding"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      let text = await response.text();

      // Inject <base> for relative paths
      const baseTag = `<base href="${targetUrl}">`;
      text = text.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);

      res.send(text);
    } else {
      // Binary content
      const buffer = Buffer.from(await response.arrayBuffer());
      res.end(buffer);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
