import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { config } from "../config";
import { BYTES_PER_MS } from "./capture";

const execFileAsync = promisify(execFile);

export async function mixTracks(
    sessionId: string,
    tracks: { userId: string; filePath: string }[],
): Promise<{ outputPath: string; durationSeconds: number }> {
    if (tracks.length === 0) {
        throw new Error("Cannot mix an empty track list");
    }

    const outputPath = path.join(config.recordingsDir, `${sessionId}.mp3`);

    // Each track is already silence-padded from the session's t=0 by capture.ts
    // (padding is applied relative to session start, not each track's own first
    // packet), so there's no per-track start offset to correct for here — a plain
    // amix is enough, no adelay needed.
    const inputArgs = tracks.flatMap((track) => [
        "-f",
        "s16le",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-i",
        track.filePath,
    ]);

    // normalize=0: amix's default divides volume by input count, which would make
    // a solo speaker sound quiet — most of the time only 0-1 tracks have real
    // signal, not constant overlap, so that scaling isn't what we want here.
    const filter = `amix=inputs=${tracks.length}:duration=longest:normalize=0`;

    await execFileAsync(ffmpegPath as string, [
        "-y",
        ...inputArgs,
        "-filter_complex",
        filter,
        "-c:a",
        "libmp3lame",
        "-q:a",
        "2",
        outputPath,
    ]);

    const sizes = await Promise.all(tracks.map((track) => fs.stat(track.filePath).then((stat) => stat.size)));
    const longestTrackMs = Math.max(...sizes) / BYTES_PER_MS;
    const durationSeconds = Math.round(longestTrackMs / 1000);

    const sessionDir = path.join(config.recordingsDir, sessionId);
    await fs.rm(sessionDir, { recursive: true, force: true });

    return { outputPath, durationSeconds };
}
