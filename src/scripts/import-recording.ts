// Registers an orphaned recording file in the database and prints its download URL.
//
// Production (compiled): node dist/scripts/import-recording.js <file> <guildId> [channelId] [startedBy]
// Development:           npx tsx src/scripts/import-recording.ts <file> <guildId> [channelId] [startedBy]
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { config } from "../config";
import { importDoneSession } from "../db/sessions";
import { db } from "../db/client";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ffmpeg exits non-zero when given no output, but still prints "Duration: HH:MM:SS.xx" to stderr.
function getDurationSeconds(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        execFile(ffmpegPath as string, ["-i", filePath], (_error, _stdout, stderr) => {
            const match = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
            if (!match) {
                reject(new Error(`Could not read duration from ${filePath}`));
                return;
            }
            const [, hours, minutes, seconds] = match;
            resolve(Math.round(Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)));
        });
    });
}

async function main(): Promise<void> {
    const [fileArg, guildId, channelId = "unknown", startedBy = "unknown"] = process.argv.slice(2);

    if (!fileArg || !guildId) {
        console.error("Usage: import-recording <file> <guildId> [channelId] [startedBy]");
        process.exit(1);
    }

    // A bare filename is looked up in the recordings dir; otherwise use the path as given.
    const filePath = path.resolve(fileArg.includes(path.sep) ? fileArg : path.join(config.recordingsDir, fileArg));
    const stat = fs.statSync(filePath);
    const durationSeconds = await getDurationSeconds(filePath);

    const existing = db.prepare(`SELECT id FROM recording_sessions WHERE output_path = ?`).get(filePath);
    if (existing) {
        console.error(`${filePath} is already registered.`);
        process.exit(1);
    }

    const baseName = path.basename(filePath, path.extname(filePath));
    const session = importDoneSession({
        id: UUID_PATTERN.test(baseName) ? baseName : crypto.randomUUID(),
        guildId,
        channelId,
        startedBy,
        // The real start time is unknown; the file's mtime is when mixing finished.
        startedAt: stat.mtimeMs - durationSeconds * 1000,
        durationSeconds,
        outputPath: filePath,
    });

    console.log(`Imported ${session.id} (${durationSeconds}s)`);
    console.log(`${config.publicBaseUrl}/recordings/${session.downloadToken}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
