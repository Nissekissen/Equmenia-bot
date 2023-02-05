const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ButtonStyle } = require('discord.js');
const { regions } = require('../../roles.json');
const formCancel = require('../buttons/form-cancel');
const formNext = require('../buttons/form-next');
const formRoles = require('../buttons/form-roles');
require('../utils/embedData.js')

module.exports = {
    execute: async (interaction, channel) => {

        const embed = new EmbedBuilder()
            .setTitle('Välj region')
            .setDescription('Välj vilken/vilka regioner du tillhör. Detta kan vara antingen vilken region du bor i eller vilken region kyrkan ligger i.')
            .setImage('https://equmeniakyrkan.se/wp-content/uploads/2019/12/RegionerKarta-267x640.png')
        embed.addData(embed);
        
        
        const row = new ActionRowBuilder()
            .addComponents(formRoles.builder.setOptions(regions))
        
        const next = new ActionRowBuilder()
            .addComponents(
                formCancel.builder,
                formNext.builder,
                

            )
        
        await interaction.update({ components: [row, next], embeds: [embed] });
        
    }
}