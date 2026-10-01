import type { VoiceConnection } from "@discordjs/voice";

const activeConnections = new Map<string, VoiceConnection>();

export function setConnection(guildId: string, connection: VoiceConnection): void {
    activeConnections.set(guildId, connection);
}

export function getConnection(guildId: string): VoiceConnection | undefined {
    return activeConnections.get(guildId);
}

export function removeConnection(guildId: string): void {
    activeConnections.delete(guildId);
}
