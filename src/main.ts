import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { loadEvents } from "./events";
import { startServer } from "./http/server";

async function main(): Promise<void> {
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });

    loadEvents(client);

    await startServer();
    await client.login(config.discordToken);
}

main().catch((error) => {
    console.error("Fatal error during startup:", error);
    process.exit(1);
});
