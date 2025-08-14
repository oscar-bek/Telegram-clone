const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// SSL certificate paths
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl/localhost.key")),
  cert: fs.readFileSync(path.join(__dirname, "ssl/localhost.crt")),
};

app.prepare().then(() => {
  // Create HTTPS server
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 HTTPS Server ready on https://${hostname}:${port}`);
    console.log("🔒 SSL certificates loaded successfully");
    console.log("🌐 WebRTC will work with secure context");
  });
});
