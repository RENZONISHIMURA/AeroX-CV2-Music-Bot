console.clear();
console.log("🚀 Starting Bot...");

async function startBot() {
    try {
        console.log("🔊 Starting Lavalink...");
        const startLavalink = require("./lavalink/index.js");

        // If lavalink exports a function
        if (typeof startLavalink === "function") {
            await startLavalink();
        }

        console.log("✅ Lavalink Started Successfully.");

        console.log("🤖 Starting AeroX...");
        const startAeroX = require("./AeroX/index.js");

        if (typeof startAeroX === "function") {
            await startAeroX();
        }

        console.log("✅ AeroX Started Successfully.");
        console.log("🎧 Bot is fully online!");

    } catch (err) {
        console.error("❌ Startup Failed:", err);
        process.exit(1);
    }
}

startBot();
