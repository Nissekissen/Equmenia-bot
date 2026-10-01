import { SlashCommandBuilder } from "discord.js";
import { getConnection, removeConnection } from "../voice/connectionManager";
import type { Command } from "../types";

export const data = new SlashCommandBuilder().setName("leave").setDescription("Leave the current channel");

export const execute: Command["execute"] = async (interaction) => {
    if (!interaction.inCachedGuild()) {
        await interaction.reply({ content: "This command only works in a server.", ephemeral: true });
        return;
    }

    const connection = getConnection(interaction.guildId);
    if (!connection) {
        await interaction.reply({ content: "I'm not connected to a voice channel.", ephemeral: true });
        return;
    }

    connection.destroy();
    removeConnection(interaction.guildId);
    await interaction.reply({ content: "Left the channel.", ephemeral: true });
};
