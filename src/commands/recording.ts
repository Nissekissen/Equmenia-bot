import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";

export const data = new SlashCommandBuilder()
    .setName("recording")
    .setDescription("Control recording of the joined stage channel")
    .addSubcommand((sub) => sub.setName("start").setDescription("Start recording the joined stage channel"))
    .addSubcommand((sub) => sub.setName("stop").setDescription("Stop recording and finalize the file"))
    .addSubcommand((sub) => sub.setName("list").setDescription("List past recordings for this server"));

export const execute: Command["execute"] = async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case "start":
            // TODO: voice/capture.ts to start per-speaker capture + db/sessions.ts createSession
            await interaction.reply({ content: "Not implemented yet.", ephemeral: true });
            break;
        case "stop":
            // TODO: voice/mixer.ts to flatten tracks + db/sessions.ts endSession
            await interaction.reply({ content: "Not implemented yet.", ephemeral: true });
            break;
        case "list":
            // TODO: db/sessions.ts listSessions + build download links from config.publicBaseUrl
            await interaction.reply({ content: "Not implemented yet.", ephemeral: true });
            break;
        default:
            await interaction.reply({ content: "Unknown subcommand.", ephemeral: true });
    }
};
