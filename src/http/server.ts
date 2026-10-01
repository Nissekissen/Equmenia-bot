import Fastify, { type FastifyInstance } from "fastify";
import { config } from "../config";

export function createServer(): FastifyInstance {
    const app = Fastify({ logger: false });

    app.get("/recordings/:token", async (request, reply) => {
        // TODO: look up the session by download token in db/sessions.ts
        // and stream config.recordingsDir/<...>/final file back.
        reply.code(501).send({ error: "Not implemented yet" });
    });

    return app;
}

export async function startServer(): Promise<void> {
    const app = createServer();
    await app.listen({ port: config.httpPort, host: "0.0.0.0" });
    console.log(`HTTP server listening on port ${config.httpPort}`);
}
