// Diagnostic: captures RAW, undecoded Opus packets straight from a live stage
// channel into a .ogg file, bypassing prism-media/@discordjs/opus entirely.
// ffmpeg then decodes that file with its OWN independent Opus decoder to produce
// an MP3. If this MP3 is clean, the bug is in our decode pipeline (capture.ts).
// If it glitches too, the problem is in the data we're receiving, not our code.
// Usage: npm run raw-capture-poc -- <stage-channel-id> [seconds]
import "dotenv/config";
import { execFileSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { Client, GatewayIntentBits } from "discord.js";
import { EndBehaviorType, VoiceConnectionStatus, entersState, joinVoiceChannel } from "@discordjs/voice";
import { OggOpusWriter } from "./lib/ogg-opus-writer";

const channelId = process.argv[2];
const seconds = Number(process.argv[3] ?? 20);

if (!channelId) {
    console.error("Usage: npm run raw-capture-poc -- <stage-channel-id> [seconds]");
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
    console.log(`Connected to "${channel.name}". Recording raw for ${seconds}s — talk into your mic now.`);

    const writers = new Map<string, OggOpusWriter>();
    const packetCounts = new Map<string, number>();
    const activeStreams = new Set<string>();
    let startEventCount = 0;

    connection.receiver.speaking.on("start", (userId) => {
        startEventCount++;
        let writer = writers.get(userId);
        if (!writer) {
            writer = new OggOpusWriter(`/tmp/raw-${userId}.ogg`, { sampleRate: 48000, channels: 2 });
            writers.set(userId, writer);
        }

        // Same guard as capture.ts: Discord's speaking-start can refire for a brief pause
        // before the previous subscription's own silence timeout has elapsed. Without this,
        // connection.receiver.subscribe() returns the SAME still-live stream a second time,
        // and we'd attach a second "data" listener to it — double-processing every packet.
        if (activeStreams.has(userId)) {
            console.log(`[start #${startEventCount}] user=${userId} SKIPPED (already active)`);
            return;
        }
        activeStreams.add(userId);

        const opusStream = connection.receiver.subscribe(userId, {
            end: { behavior: EndBehaviorType.AfterSilence, duration: 500 },
        });

        // --- TEMP DIAGNOSTICS ---
        console.log(
            `[start #${startEventCount}] user=${userId} existingDataListeners=${opusStream.listenerCount("data")}`,
        );
        // --- end temp diagnostics ---

        opusStream.on("data", (packet: Buffer) => {
            packetCounts.set(userId, (packetCounts.get(userId) ?? 0) + 1);
            try {
                writer!.writePacket(packet);
            } catch (error) {
                console.error(`[error] writePacket failed for user=${userId}:`, error);
            }
        });

        // AudioReceiveStream's push() schedules its own destroy() via process.nextTick
        // BEFORE calling super.push(null) — so the destroy always wins the race and "end"
        // never actually fires on this stream. "close" is the event that reliably does
        // (it's what @discordjs/voice's own internal subscription cleanup listens for too).
        opusStream.once("close", () => {
            activeStreams.delete(userId);
        });
    });

    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

    console.log("Stopping, finalizing files...");
    for (const [userId, writer] of writers) {
        console.log(`[summary] user=${userId} totalPacketsWritten=${packetCounts.get(userId) ?? 0}`);
        await writer.finish();
        const mp3Path = `/tmp/raw-${userId}.mp3`;
        execFileSync(ffmpegPath as string, ["-y", "-i", `/tmp/raw-${userId}.ogg`, mp3Path]);
        console.log(`${userId}: ${mp3Path}`);
    }

    connection.destroy();
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
