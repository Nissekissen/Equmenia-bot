import { ChannelType, SlashCommandBuilder } from "discord.js";
import { VoiceConnectionStatus, entersState, joinVoiceChannel } from "@discordjs/voice";
import { setConnection, removeConnection } from "../voice/connectionManager";
import { getActiveSession, endSession } from "../db/sessions";
import { stopCapture } from "../voice/capture";
import type { Command, CommandMeta } from "../types";

export const data = new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a stage channel so it can be recorded")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The stage channel to join (defaults to the one you're currently in)")
            .addChannelTypes(ChannelType.GuildStageVoice),
    );

export const meta: CommandMeta = {
    longDescription: "Join a stage channel for recording. Supply a stage channel to specify what channel to join, otherwise it defaults to the channel you are currenltly in.",
    usage: "\`/join [channel]\`, where \`[channel]\` is optional.",
}

export const execute: Command["execute"] = async (interaction) => {
    if (!interaction.inCachedGuild()) {
        await interaction.reply({ content: "This command only works in a server.", ephemeral: true });
        return;
    }

    const channelOption = interaction.options.getChannel("channel");
    const channel = channelOption ?? interaction.member.voice.channel;

    if (!channel || channel.type !== ChannelType.GuildStageVoice) {
        await interaction.reply({
            content: channelOption
                ? "That channel is not a stage channel."
                : "You're not in a stage channel. Join one first, or pass a channel to /join.",
            ephemeral: true,
        });
        return;
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 10_000);
    } catch (error) {
        connection.destroy();
        await interaction.reply({
            content: "Couldn't connect to that channel in time. Check I have permission to join it.",
            ephemeral: true,
        });
        return;
    }

    const guildId = channel.guild.id;

    // Transient network blips also land here as "Disconnected" — race entering either
    // Signalling or Connecting against a timeout to tell a real drop (channel deleted,
    // bot kicked, etc.) apart from one @discordjs/voice will recover from on its own.
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch {
            connection.destroy();
        }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
        removeConnection(guildId);

        const session = getActiveSession(guildId);
        if (!session) return;

        stopCapture(guildId)
            .catch(() => undefined)
            .finally(() => {
                endSession(session.id, { status: "failed", outputPath: null, durationSeconds: null });
            });
    });

    setConnection(guildId, connection);
    await interaction.reply({ content: `Joined the channel <#${channel.id}>`, ephemeral: true });
};
