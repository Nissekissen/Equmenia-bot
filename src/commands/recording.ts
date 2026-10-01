import { SlashCommandBuilder, time, hyperlink, EmbedBuilder } from "discord.js";
import { getConnection } from "../voice/connectionManager";
import { startCapture, stopCapture } from "../voice/capture";
import { getActiveSession, createSession, endSession, listSessions } from "../db/sessions";
import { mixTracks } from "../voice/mixer";
import { config } from "../config";
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
        case "start": {
            if (!interaction.inCachedGuild()) {
                await interaction.reply({ content: "This command only works in a server.", ephemeral: true });
                return;
            }

            const connection = getConnection(interaction.guildId);
            if (!connection || !connection.joinConfig.channelId) {
                await interaction.reply({
                    content: "You are not in a voice channel. Use /join first.",
                    ephemeral: true,
                });
                return;
            }

            let session = getActiveSession(interaction.guildId);
            if (session !== undefined) {
                await interaction.reply({ content: "Already recording.", ephemeral: true });
                return;
            }

            session = createSession({
                guildId: interaction.guildId,
                channelId: connection.joinConfig.channelId,
                startedBy: interaction.user.id,
            });
            startCapture(interaction.guildId, connection, session.id);

            await interaction.reply({
                content: "Recording started. Stop with /recording stop",
                ephemeral: true,
            });
            break;
        }
        case "stop": {
            if (!interaction.inCachedGuild()) {
                await interaction.reply({ content: "This command only works in a server.", ephemeral: true });
                return;
            }

            const session = getActiveSession(interaction.guildId);
            if (!session) {
                await interaction.reply({
                    content: "Nothing is being recorded. Start with /recording start",
                    ephemeral: true,
                });
                return;
            }

            try {
                const tracks = await stopCapture(interaction.guildId);

                if (tracks.length === 0) {
                    endSession(session.id, { status: "failed", outputPath: null, durationSeconds: null });
                    await interaction.reply({
                        content: "Nobody spoke, so there's nothing to save.",
                        ephemeral: true,
                    });
                    break;
                }

                const { outputPath, durationSeconds } = await mixTracks(session.id, tracks);
                endSession(session.id, { status: "done", outputPath, durationSeconds });
                await interaction.reply({
                    content: `Recording stopped. Download: ${config.publicBaseUrl}/recordings/${session.downloadToken}`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error("Error with mixer: ", error);
                endSession(session.id, { status: "failed", outputPath: null, durationSeconds: null });
                await interaction.reply({
                    content: "Something went wrong when saving recording. Check logs for more info.",
                    ephemeral: true,
                });
            }

            break;
        }
        case "list": {
            if (!interaction.inCachedGuild()) {
                await interaction.reply({ content: "This command only works in a server.", ephemeral: true });
                return;
            }

            const sessions = listSessions(interaction.guildId);
            const done = sessions.filter((session) => session.status === "done");
            const description =
                done.length === 0
                    ? "No recordings"
                    : done
                          .map((session) => {
                              const url = `${config.publicBaseUrl}/recordings/${session.downloadToken}`;
                              return `${time(Math.floor(session.startedAt / 1000), "D")}: ${hyperlink("Download", url)}`;
                          })
                          .join("\n");

            const embed = new EmbedBuilder().setTitle("Recordings").setDescription(description);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            break;
        }
        default:
            await interaction.reply({ content: "Unknown subcommand.", ephemeral: true });
    }
};
