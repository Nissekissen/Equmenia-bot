const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const fs = require('fs');

module.exports = {
    builder: new ButtonBuilder()
        .setLabel('Skicka')
        .setCustomId('form-submit')
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),
    async execute(interaction) {
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        channel.messages.fetch().then(async result => {
            const message = result.filter(m => m.author.bot === false).first();
            const submit = require('../form/submit');
            await submit.execute(interaction, channel, message.content, message);
        });
    }
}