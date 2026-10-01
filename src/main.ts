import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { loadEvents } from "./events";
import { startServer } from "./http/server";
import { startCleanupJob } from "./jobs/cleanup";
import { startDailyVerseJob } from "./jobs/dailyVerse";
import { failStaleSessions } from "./db/sessions";

async function main(): Promise<void> {
    // Any session still marked "recording" at boot belongs to a process that died or
    // was redeployed mid-recording — nothing is capturing it anymore, so it would
    // otherwise block /recording start for that guild forever.
    failStaleSessions();

    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    loadEvents(client);

    await startServer();
    startCleanupJob();
    startDailyVerseJob(client);
    await client.login(config.discordToken);
}

main().catch((error) => {
    console.error("Fatal error during startup:", error);
    process.exit(1);
});
