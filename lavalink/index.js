const fs = require("fs");
const https = require("https");
const { spawn } = require("child_process");
const path = require("path");

const LAVALINK_VERSION = "4.0.7";
const JAR_NAME = "Lavalink.jar";
const JAR_PATH = path.join(__dirname, JAR_NAME);

const DOWNLOAD_URL = `https://github.com/lavalink-devs/Lavalink/releases/download/${LAVALINK_VERSION}/Lavalink.jar`;

// Download Lavalink if not exists
function downloadLavalink() {
  return new Promise((resolve, reject) => {
    console.log("📥 Downloading Lavalink...");

    const file = fs.createWriteStream(JAR_PATH);
    https.get(DOWNLOAD_URL, (res) => {
      if (res.statusCode !== 200) {
        return reject(`Failed to download Lavalink (${res.statusCode})`);
      }

      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", reject);
  });
}

// Start Lavalink
function startLavalink() {
  console.log("🚀 Starting Lavalink server...");

  const lavalink = spawn("java", [
    "-jar",
    JAR_NAME
  ], {
    cwd: __dirname
  });

  lavalink.stdout.on("data", (data) => {
    console.log(`[LAVALINK] ${data.toString().trim()}`);
  });

  lavalink.stderr.on("data", (data) => {
    console.error(`[LAVALINK ERROR] ${data.toString().trim()}`);
  });

  lavalink.on("close", (code) => {
    console.log(`❌ Lavalink stopped (code ${code}). Restarting in 5s...`);
    setTimeout(startLavalink, 5000);
  });
}

// Init
(async () => {
  try {
    if (!fs.existsSync(JAR_PATH)) {
      await downloadLavalink();
    }

    startLavalink();
  } catch (err) {
    console.error("❌ Failed to start Lavalink:", err);
  }
})();
