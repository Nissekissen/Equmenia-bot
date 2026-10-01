import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
    DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
    DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID is required"),
    DISCORD_DEV_GUILD_ID: z.string().optional(),
    ALLOWED_ROLE_IDS: z.string().default(""),
    DATA_DIR: z.string().default("./data"),
    HTTP_PORT: z.coerce.number().default(3000),
    PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

const env = parsed.data;
const dataDir = path.resolve(env.DATA_DIR);
const recordingsDir = path.join(dataDir, "recordings");

export const config = {
    discordToken: env.DISCORD_TOKEN,
    discordClientId: env.DISCORD_CLIENT_ID,
    discordDevGuildId: env.DISCORD_DEV_GUILD_ID,
    allowedRoleIds: env.ALLOWED_ROLE_IDS.split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    dataDir,
    recordingsDir,
    sqlitePath: path.join(dataDir, "sqlite.db"),
    httpPort: env.HTTP_PORT,
    publicBaseUrl: env.PUBLIC_BASE_URL,
};

fs.mkdirSync(config.recordingsDir, { recursive: true });
