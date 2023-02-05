const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require("discord.js");
const fs = require('fs');

module.exports = {
    builder: new SelectMenuBuilder()
        .setCustomId('form-roles')
        .setPlaceholder('Inget valt.'),
    async execute(interaction) {
        interaction.component.options.forEach(async option => {
            if (!isNaN(option.value)) {
                const role = interaction.message.guild.roles.cache.find(r => r.id == option.value);
                if (role != undefined && interaction.values.findIndex(v => v == role.id) == -1) {
                    await interaction.member.roles.remove(role);
                }
            }
        })
        interaction.values.forEach(async value => {
            if (!isNaN(value)) {
                const role = interaction.message.guild.roles.cache.find(r => r.id === value)
                if (role != undefined) {
                    await interaction.member.roles.add(role)
                }
            }
        })

        await interaction.deferUpdate();
    }
}