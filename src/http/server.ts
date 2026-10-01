import fs from "node:fs";
import Fastify, { type FastifyInstance } from "fastify";
import { config } from "../config";
import { getSessionByToken } from "../db/sessions";

export function createServer(): FastifyInstance {
    const app = Fastify({ logger: false });

    app.get<{ Params: { token: string } }>("/recordings/:token", async (request, reply) => {
        const session = getSessionByToken(request.params.token);

        if (!session || session.status !== "done" || !session.outputPath) {
            reply.code(404).send({ error: "Recording not found" });
            return;
        }

        const stream = fs.createReadStream(session.outputPath);
        stream.on("error", (error) => {
            console.error(`Error streaming recording ${session.id}:`, error);
            if (!reply.sent) {
                reply.code(404).send({ error: "Recording not found" });
            }
        });

        reply.header("Content-Type", "audio/mpeg");
        reply.header("Content-Disposition", `attachment; filename="recording-${session.id}.mp3"`);
        return reply.send(stream);
    });

    return app;
}

export async function startServer(): Promise<void> {
    const app = createServer();
    await app.listen({ port: config.httpPort, host: "0.0.0.0" });
    console.log(`HTTP server listening on port ${config.httpPort}`);
}
