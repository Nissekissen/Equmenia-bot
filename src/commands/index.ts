import fs from "node:fs";
import path from "node:path";
import { Collection } from "discord.js";
import type { Command } from "../types";

export function loadCommands(): Collection<string, Command> {
    const commands = new Collection<string, Command>();
    const commandsDir = __dirname;

    const files = fs
        .readdirSync(commandsDir)
        .filter(
            (file) => file !== path.basename(__filename) && (file.endsWith(".ts") || file.endsWith(".js")),
        );

    for (const file of files) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const commandModule = require(path.join(commandsDir, file)) as Command;
        commands.set(commandModule.data.name, commandModule);
    }

    return commands;
}
