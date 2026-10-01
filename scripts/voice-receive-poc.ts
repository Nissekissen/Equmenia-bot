// Throwaway proof-of-concept: confirms the bot can receive Opus audio from a
// stage channel while suppressed (audience, not a speaker). Not part of the app.
// Usage: npm run voice-poc -- <stage-channel-id>
import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { EndBehaviorType, VoiceConnectionStatus, entersState, joinVoiceChannel } from "@discordjs/voice";

const channelId = process.argv[2];
if (!channelId) {
    console.error("Usage: npm run voice-poc -- <stage-channel-id>");
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isVoiceBased()) {
        console.error("That ID isn't a voice/stage channel this bot can see.");
        process.exit(1);
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
    console.log(`Connected to "${channel.name}" as audience. Waiting for someone to speak...`);

    connection.receiver.speaking.on("start", (userId) => {
        console.log(`>>> ${userId} started speaking`);
        const opusStream = connection.receiver.subscribe(userId, {
            end: { behavior: EndBehaviorType.AfterSilence, duration: 500 },
        });

        let bytes = 0;
        opusStream.on("data", (chunk: Buffer) => {
            bytes += chunk.length;
        });
        opusStream.on("end", () => {
            console.log(`<<< ${userId} stopped speaking, received ${bytes} bytes of Opus data`);
        });
    });
});

client.login(process.env.DISCORD_TOKEN);
