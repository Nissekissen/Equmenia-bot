import fs from "node:fs/promises";
import { deleteSession, getExpiredSessions } from "../db/sessions";

export async function cleanupExpiredRecordings(): Promise<void> {
    const expired = getExpiredSessions();

    for (const session of expired) {
        if (session.outputPath) {
            try {
                await fs.unlink(session.outputPath);
            } catch (error) {
                console.error(`Failed to delete recording file for session ${session.id}:`, error);
            }
        }
        deleteSession(session.id);
    }
}

export function startCleanupJob(intervalMs = 60 * 60 * 1000): NodeJS.Timeout {
    cleanupExpiredRecordings().catch((error) => console.error("Error during recording cleanup:", error));

    return setInterval(() => {
        cleanupExpiredRecordings().catch((error) => console.error("Error during recording cleanup:", error));
    }, intervalMs);
}
