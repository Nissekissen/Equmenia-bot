const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const fs = require('fs');

module.exports = {
    builder: new ButtonBuilder()
        .setLabel('Skriv om')
        .setCustomId('form-rewrite-intro')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false),
    async execute(interaction) {
        const channel = interaction.channel;
        const messages = channel.messages.cache.last(2);
        messages.forEach(async message => await message.delete());
        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
        activeChannels.channels.find(v => v.channelId == interaction.customId.split("-")[3]).intro = true;
        fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));
    }
}