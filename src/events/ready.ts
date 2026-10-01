import { Events, REST, Routes, type Client } from "discord.js";
import { config } from "../config";
import { loadCommands } from "../commands";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client<true>): Promise<void> {
    console.log(`Logged in as ${client.user.tag}`);

    const commands = loadCommands();
    const rest = new REST().setToken(config.discordToken);
    const body = commands.map((command) => command.data.toJSON());

    // Guild-scoped registration updates instantly; global registration can take up to an hour
    // to propagate, which is painful during development. Set DISCORD_DEV_GUILD_ID to skip that.
    if (config.discordDevGuildId) {
        await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordDevGuildId), {
            body,
        });
        console.log(`Registered ${commands.size} application commands to guild ${config.discordDevGuildId}.`);
    } else {
        await rest.put(Routes.applicationCommands(config.discordClientId), { body });
        console.log(`Registered ${commands.size} application commands globally.`);
    }
}
