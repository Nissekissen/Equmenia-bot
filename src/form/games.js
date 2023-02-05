const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
require('../utils/embedData')
const { games } = require('../../roles.json')
const formCancel = require("../buttons/form-cancel");
const formNext = require("../buttons/form-next");
const formRoles = require("../buttons/form-roles");

module.exports = {
    execute: async (interaction, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Välj spel')
            .setDescription('Välj de spel du brukar spela/är intresserad av att spela.')
        embed.addData(embed)
        
        const row = new ActionRowBuilder()
            .addComponents(formRoles.builder.setOptions(games))
        
        const next = new ActionRowBuilder()
            .addComponents(
                formCancel.builder,
                formNext.builder,
                
            )
        
        await interaction.update({ components: [row, next], embeds: [embed] })
    }
}