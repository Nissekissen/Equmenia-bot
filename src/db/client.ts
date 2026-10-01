import Database from "better-sqlite3";
import { config } from "../config";

export const db = new Database(config.sqlitePath);
db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS recording_sessions (
        id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        started_by TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        status TEXT NOT NULL,
        output_path TEXT,
        duration_seconds INTEGER,
        download_token TEXT NOT NULL UNIQUE
    );
`);
