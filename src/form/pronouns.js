const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

const { pronouns } = require('../../roles.json')
const formCancel = require("../buttons/form-cancel")
const formNext = require("../buttons/form-next")
const formRoles = require("../buttons/form-roles")

require('../utils/embedData')

module.exports = {
    execute: async (interaction, channel) => {

        const embed = new EmbedBuilder()
            .setTitle('Välj Pronomen')
            .setDescription('Välj vilka pronomen du använder.')
        embed.addData(embed);
        const row = new ActionRowBuilder()
            .addComponents(formRoles.builder.setOptions(pronouns))
        
        const next = new ActionRowBuilder()
            .addComponents(
                formCancel.builder,
                formNext.builder,
                

            )
        
        await interaction.update({ components: [row, next], embeds: [embed] });

    }
}