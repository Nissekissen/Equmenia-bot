const { ActivityType } = require("discord.js");
const Tags = require("../index.js");
const logger = require("../utils/logger.js");

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        logger.log("Bot is ready!");
        client.user.setPresence({
            activities: [
                { name: "Bible: The Movie", type: ActivityType.Watching },
            ],
            status: "online",
        });

        
    },
};
