const fs = require("fs");
const { sections } = require("../../forms.json");
const { ModalBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    builder: new ButtonBuilder()
        .setCustomId("intro_modal_btn")
        .setLabel("Starta")
        .setStyle(ButtonStyle.Success),
    async execute(interaction) {
        // Get the channel and form data and open the modal from there

        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
        const sectionId = activeChannels.channels.find(data => data.channelId === interaction.channel.id).sectionId;
        const section = sections.find(obj => obj.id == sectionId);

        if (section.type != "modal") return await interaction.reply({ content: 'Ett oväntat fel uppstod.', ephemeral: true });

        const modal = ModalBuilder.from(section.menu);
        await interaction.showModal(modal);

    },
};
