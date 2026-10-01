import { Events, type Interaction } from "discord.js";
import { loadCommands } from "../commands";

export const name = Events.InteractionCreate;

const commands = loadCommands();

export async function execute(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        const payload = { content: "Something went wrong running that command.", ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(payload);
        } else {
            await interaction.reply(payload);
        }
    }
}
