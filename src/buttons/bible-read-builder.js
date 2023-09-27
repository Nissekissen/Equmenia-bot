const { ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    builder: new ButtonBuilder()
        .setCustomId("bible_read-")
        .setLabel("Läs Vidare")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false),
    backBuilder: new ButtonBuilder()
        .setCustomId("bible_read-")
        .setLabel("Tillbaka")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false),
    executePath: "bible-read.js"
}