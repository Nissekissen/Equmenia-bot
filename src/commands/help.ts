import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command, CommandMeta } from "../types";
import { loadCommands } from "../commands";

export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("View a list of commands.")

export const meta: CommandMeta = {
    longDescription: "View a list of commands and how to use them.",
    usage: "`/help`"
}

export const execute: Command["execute"] = async (interaction) => {
    const commands = [...loadCommands().values()].sort((a, b) => a.data.name.localeCompare(b.data.name));

    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Commands")
        .setDescription("Here's everything I can do.")
        .setFields(
            commands.map((command) => {
                const { longDescription, usage, examples } = command.meta;

                const value = [
                    longDescription,
                    `**Usage:** ${usage}`,
                    examples?.length
                        ? `**Examples:**\n${examples.map((example) => `• ${example}`).join("\n")}`
                        : null,
                ]
                    .filter((part): part is string => part !== null)
                    .join("\n");

                return { name: `/${command.data.name}`, value };
            }),
        )
        .setFooter({ text: "Equmenia Bot" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
};
