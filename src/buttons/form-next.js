const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const fs = require('fs');

module.exports = {
    builder: new ButtonBuilder()
        .setLabel('Nästa')
        .setStyle(ButtonStyle.Success)
        .setCustomId('form-next'),
    async execute(interaction) {
        let formName;
        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
        const oldFormName = activeChannels.channels.find(data => data.channelId === interaction.channel.id).currentForm;
        switch (oldFormName) {
            case "start":
                formName = 'region'
                break;
            case "region":
                formName = 'pronouns'
                break;
            case "pronouns":
                formName = 'games'
                break;
            case "games":
                formName = 'intro'
                break;
        }
        activeChannels.channels.find(data => data.channelId === interaction.channel.id).currentForm = formName
        fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));
        const form = require(`../form/${formName}`);
        await form.execute(interaction, interaction.channel);
    }
}