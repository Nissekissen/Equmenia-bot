import crypto from "node:crypto";
import { db } from "./client";
import type { RecordingSession, RecordingSessionStatus } from "../types";

interface RecordingSessionRow {
    id: string;
    guild_id: string;
    channel_id: string;
    started_by: string;
    started_at: number;
    ended_at: number | null;
    status: RecordingSessionStatus;
    output_path: string | null;
    duration_seconds: number | null;
    download_token: string;
    downloaded_at: number | null;
}

function rowToSession(row: RecordingSessionRow): RecordingSession {
    return {
        id: row.id,
        guildId: row.guild_id,
        channelId: row.channel_id,
        startedBy: row.started_by,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        status: row.status,
        outputPath: row.output_path,
        durationSeconds: row.duration_seconds,
        downloadToken: row.download_token,
        downloadedAt: row.downloaded_at,
    };
}

export const DOWNLOAD_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
export const MAX_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const insertStatement = db.prepare(`
    INSERT INTO recording_sessions (id, guild_id, channel_id, started_by, started_at, status, download_token)
    VALUES (@id, @guildId, @channelId, @startedBy, @startedAt, @status, @downloadToken)
`);

export function createSession(params: {
    guildId: string;
    channelId: string;
    startedBy: string;
}): RecordingSession {
    const session: RecordingSession = {
        id: crypto.randomUUID(),
        guildId: params.guildId,
        channelId: params.channelId,
        startedBy: params.startedBy,
        startedAt: Date.now(),
        endedAt: null,
        status: "recording",
        outputPath: null,
        durationSeconds: null,
        downloadToken: crypto.randomBytes(32).toString("hex"),
        downloadedAt: null,
    };

    insertStatement.run(session);
    return session;
}

const endStatement = db.prepare(`
    UPDATE recording_sessions
    SET ended_at = @endedAt, status = @status, output_path = @outputPath, duration_seconds = @durationSeconds
    WHERE id = @id
`);

export function endSession(
    id: string,
    result: { status: RecordingSessionStatus; outputPath: string | null; durationSeconds: number | null },
): void {
    endStatement.run({
        id,
        endedAt: Date.now(),
        status: result.status,
        outputPath: result.outputPath,
        durationSeconds: result.durationSeconds,
    });
}

const getActiveSessionStatement = db.prepare(`
    SELECT * FROM recording_sessions WHERE guild_id = ? AND status = 'recording' LIMIT 1
`);

export function getActiveSession(guildId: string): RecordingSession | undefined {
    const row = getActiveSessionStatement.get(guildId) as RecordingSessionRow | undefined;
    return row ? rowToSession(row) : undefined;
}

const listSessionsStatement = db.prepare(`
    SELECT * FROM recording_sessions WHERE guild_id = ? ORDER BY started_at DESC LIMIT ?
`);

export function listSessions(guildId: string, limit = 10): RecordingSession[] {
    const rows = listSessionsStatement.all(guildId, limit) as RecordingSessionRow[];
    return rows.map(rowToSession);
}

const getByTokenStatement = db.prepare(`
    SELECT * FROM recording_sessions WHERE download_token = ? LIMIT 1
`);

export function getSessionByToken(token: string): RecordingSession | undefined {
    const row = getByTokenStatement.get(token) as RecordingSessionRow | undefined;
    return row ? rowToSession(row) : undefined;
}

const markDownloadedStatement = db.prepare(`
    UPDATE recording_sessions
    SET downloaded_at = @downloadedAt
    WHERE download_token = @token AND downloaded_at IS NULL
`);

export function markDownloaded(token: string): void {
    markDownloadedStatement.run({ token, downloadedAt: Date.now() });
}

const getExpiredSessionsStatement = db.prepare(`
    SELECT * FROM recording_sessions
    WHERE status = 'done'
      AND (
        (downloaded_at IS NOT NULL AND downloaded_at <= @downloadCutoff)
        OR started_at <= @retentionCutoff
      )
`);

export function getExpiredSessions(): RecordingSession[] {
    const now = Date.now();
    const rows = getExpiredSessionsStatement.all({
        downloadCutoff: now - DOWNLOAD_GRACE_PERIOD_MS,
        retentionCutoff: now - MAX_RETENTION_MS,
    }) as RecordingSessionRow[];
    return rows.map(rowToSession);
}

const deleteSessionStatement = db.prepare(`DELETE FROM recording_sessions WHERE id = ?`);

export function deleteSession(id: string): void {
    deleteSessionStatement.run(id);
}

const failStaleSessionsStatement = db.prepare(`
    UPDATE recording_sessions
    SET status = 'failed', ended_at = @endedAt
    WHERE status = 'recording'
`);

export function failStaleSessions(): void {
    failStaleSessionsStatement.run({ endedAt: Date.now() });
}
