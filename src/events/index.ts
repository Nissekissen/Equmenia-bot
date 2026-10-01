import fs from "node:fs";
import path from "node:path";
import type { Client } from "discord.js";

interface DiscordEvent {
    name: string;
    once?: boolean;
    execute: (...args: unknown[]) => unknown;
}

export function loadEvents(client: Client): void {
    const eventsDir = __dirname;

    const files = fs
        .readdirSync(eventsDir)
        .filter(
            (file) => file !== path.basename(__filename) && (file.endsWith(".ts") || file.endsWith(".js")),
        );

    for (const file of files) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const eventModule = require(path.join(eventsDir, file)) as DiscordEvent;

        if (eventModule.once) {
            client.once(eventModule.name, eventModule.execute);
        } else {
            client.on(eventModule.name, eventModule.execute);
        }
    }
}
