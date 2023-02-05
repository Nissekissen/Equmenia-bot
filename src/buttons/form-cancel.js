const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const fs = require('fs');

module.exports = {
    builder: new ButtonBuilder()
        .setLabel('Avbryt')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('form-cancel')
        .setDisabled(false),
    async execute(interaction) {
        const channel = interaction.channel;
        await channel.delete();
        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
        const index = activeChannels.channels.findIndex(channelData => channelData.channelId == channel.id);
        activeChannels.channels.splice(index, 1);
        fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));
    }
}