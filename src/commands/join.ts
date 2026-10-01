import { ChannelType, SlashCommandBuilder } from "discord.js";
import { VoiceConnectionStatus, entersState, joinVoiceChannel } from "@discordjs/voice";
import { setConnection } from "../voice/connectionManager";
import type { Command } from "../types";

export const data = new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join a stage channel so it can be recorded")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The stage channel to join (defaults to the one you're currently in)")
            .addChannelTypes(ChannelType.GuildStageVoice),
    );

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

    setConnection(channel.guild.id, connection);
    await interaction.reply({ content: `Joined the channel <#${channel.id}>`, ephemeral: true });
};
