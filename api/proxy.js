export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("Missing url parameter");

    const targetUrl = decodeURIComponent(url);
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          req.headers["user-agent"] ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });

    // Copy headers
    response.headers.forEach((value, key) => {
      if (!["content-security-policy", "x-frame-options"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);

    if (response.headers.get("content-type")?.includes("text/html")) {
      let text = await response.text();

      // Inject <base> for relative paths
      const baseTag = `<base href="${targetUrl}">`;
      text = text.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);

      res.send(text);
    } else {
      // Stream non-HTML (images, CSS, JS, etc.)
      const reader = response.body.getReader();
      async function push() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      }
      push();
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
}
