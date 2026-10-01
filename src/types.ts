import type {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface CommandMeta {
    longDescription: string;
    usage: string;
    examples?: string[];
}

export interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    meta: CommandMeta;
}

export type RecordingSessionStatus = "recording" | "processing" | "done" | "failed";

export interface RecordingSession {
    id: string;
    guildId: string;
    channelId: string;
    startedBy: string;
    startedAt: number;
    endedAt: number | null;
    status: RecordingSessionStatus;
    outputPath: string | null;
    durationSeconds: number | null;
    downloadToken: string;
    downloadedAt: number | null;
}
