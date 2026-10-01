import { AudioReceiveStream, VoiceConnection, EndBehaviorType } from "@discordjs/voice";
import fs from "fs";
import path from "path";
import prism from "prism-media";
import { config } from "../config";

interface TrackState {
    filePath: string;
    fileStream: fs.WriteStream;
    writtenUntilMs: number;
    opusStream: AudioReceiveStream | null;
    decoder: InstanceType<typeof prism.opus.Decoder> | null;
}

interface SessionCapture {
    connection: VoiceConnection;
    sessionStartMs: number;
    dir: string;
    tracks: Map<string, TrackState>;
    onSpeakingStart: (userId: string) => void;
}

const activeCaptures = new Map<string, SessionCapture>();

// 48000 Hz, stereo, 16-bit signed PCM.
const BYTES_PER_MS = 192;

export function startCapture(guildId: string, connection: VoiceConnection, sessionId: string): void {
    const dir = path.join(config.recordingsDir, sessionId);
    const sessionStartMs = Date.now();
    const tracks = new Map<string, TrackState>();

    const onSpeakingStart = (userId: string) => {
        const existing = tracks.get(userId);
        const filePath = path.join(dir, `${userId}.pcm`);
        const track: TrackState = existing ?? {
            filePath,
            fileStream: fs.createWriteStream(filePath),
            writtenUntilMs: sessionStartMs,
            opusStream: null,
            decoder: null,
        };
        if (!existing) tracks.set(userId, track);

        // Discord's own speaking-start/stop signal can fire again for a brief pause
        // (e.g. between sentences) before our subscription's silence timeout below has
        // elapsed. If a subscription is already live for this user, just keep using it
        // rather than starting a second one that would write to the same file concurrently.
        if (track.decoder) return;

        // A genuine pause just ended (or this is this user's first turn this session) —
        // pad up to now once, right at this natural turn boundary. Deciding "was there
        // silence" from per-packet arrival timing instead (as an earlier version of this
        // did) is unreliable: normal jitter delays delivery without any real content gap,
        // and an occasional multi-frame packet (several frames bundled after a brief
        // hiccup) already contains the "missing" audio, so padding for it too double-counts
        // that time. EndBehaviorType.AfterSilence below already exists specifically to tell
        // real silence apart from jitter, so we only need to trust its start/end boundary.
        const leadingGapMs = Date.now() - track.writtenUntilMs;
        if (leadingGapMs > 0) {
            track.fileStream.write(Buffer.alloc(leadingGapMs * BYTES_PER_MS));
            track.writtenUntilMs += leadingGapMs;
        }

        const opusStream = connection.receiver.subscribe(userId, {
            end: { behavior: EndBehaviorType.AfterSilence, duration: 500 },
        });
        track.opusStream = opusStream;

        const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
        track.decoder = decoder;
        opusStream.pipe(decoder);

        // pipe() normally calls decoder.end() automatically once opusStream emits "end" —
        // but AudioReceiveStream's push() schedules its own destroy() via process.nextTick
        // BEFORE calling super.push(null), so that destroy always wins the race and "end"
        // never actually fires on it. "close" is the event that reliably does (it's what
        // @discordjs/voice's own internal subscription cleanup listens for too), so we have
        // to end the decoder ourselves in response to it instead of relying on the pipe.
        opusStream.once("close", () => decoder.end());

        decoder.on("data", (chunk: Buffer) => {
            track.fileStream.write(chunk);
            track.writtenUntilMs += chunk.length / BYTES_PER_MS;
        });

        decoder.on("error", (error) => {
            console.error(`Opus decode error for user ${userId}:`, error);
        });

        decoder.on("end", () => {
            track.opusStream = null;
            track.decoder = null;
        });
    };

    fs.mkdirSync(dir, { recursive: true });

    connection.receiver.speaking.on("start", onSpeakingStart);

    activeCaptures.set(guildId, { connection, sessionStartMs, dir, tracks, onSpeakingStart });
}

// Stops a track's live decoder (if any) and waits for it to finish flushing whatever
// audio it already had in flight, then closes the file. Ending the file stream before
// a still-active decoder has drained would drop or corrupt its last few chunks.
async function finalizeTrack(track: TrackState): Promise<void> {
    if (track.decoder) {
        await new Promise<void>((resolve) => {
            track.decoder!.once("end", resolve);
            track.opusStream?.destroy();
            track.decoder!.end();
        });
    }

    await new Promise<void>((resolve) => {
        track.fileStream.end(() => resolve());
    });
}

export async function stopCapture(guildId: string): Promise<{ userId: string; filePath: string }[]> {
    const capture = activeCaptures.get(guildId);
    if (!capture) {
        throw new Error(`No active capture for guild ${guildId}`);
    }

    capture.connection.receiver.speaking.off("start", capture.onSpeakingStart);
    activeCaptures.delete(guildId);

    const tracks = Array.from(capture.tracks.entries());

    return Promise.all(
        tracks.map(async ([userId, track]) => {
            await finalizeTrack(track);
            return { userId, filePath: track.filePath };
        }),
    );
}
