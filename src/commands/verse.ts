import { SlashCommandBuilder } from "discord.js";
import type { Command, CommandMeta } from "../types";
import { postDailyVerse } from "../jobs/dailyVerse";

export const data = new SlashCommandBuilder()
    .setName("verse")
    .setDescription("Manually post today's verse right now");

export const meta: CommandMeta = {
    longDescription:
        "Immediately fetches and posts the daily verse to the configured channel, without waiting for the 06:00 schedule. Useful for testing.",
    usage: "`/verse`",
};

export const execute: Command["execute"] = async (interaction) => {
    await interaction.reply({ content: "Fetching and posting the daily verse...", ephemeral: true });

    try {
        const posted = await postDailyVerse(interaction.client);
        await interaction.followUp({
            content: posted ? "Posted." : "Nothing was posted — check the logs for why.",
            ephemeral: true,
        });
    } catch (error) {
        console.error("Error posting daily verse:", error);
        await interaction.followUp({ content: "Something went wrong. Check logs for more info.", ephemeral: true });
    }
};
