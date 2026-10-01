// Throwaway proof-of-concept: exercises the real startCapture/stopCapture against
// a live stage channel, then converts each resulting PCM track to MP3 so you can
// actually listen back and confirm silence-padding lines up correctly.
// Usage: npm run capture-poc -- <stage-channel-id> [seconds]
import "dotenv/config";
import { execFileSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { Client, GatewayIntentBits } from "discord.js";
import { VoiceConnectionStatus, entersState, joinVoiceChannel } from "@discordjs/voice";
import { startCapture, stopCapture } from "../src/voice/capture";

const channelId = process.argv[2];
const seconds = Number(process.argv[3] ?? 20);

if (!channelId) {
    console.error("Usage: npm run capture-poc -- <stage-channel-id> [seconds]");
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
    console.log(`Connected to "${channel.name}". Recording for ${seconds}s — talk into your mic now.`);

    startCapture(channel.guild.id, connection, "capture-poc");

    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

    console.log("Stopping capture...");
    const tracks = await stopCapture(channel.guild.id);

    if (tracks.length === 0) {
        console.log("No tracks captured — did anyone speak?");
    }

    for (const track of tracks) {
        const mp3Path = track.filePath.replace(/\.pcm$/, ".mp3");
        execFileSync(ffmpegPath as string, [
            "-y",
            "-f",
            "s16le",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-i",
            track.filePath,
            mp3Path,
        ]);
        console.log(`${track.userId}: ${mp3Path}`);
    }

    connection.destroy();
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
