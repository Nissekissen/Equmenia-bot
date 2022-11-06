const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

const { pronouns } = require('../../roles.json')

require('../utils/embedData')

module.exports = {
    execute: async (interaction, channel) => {

        const embed = new EmbedBuilder()
            .setTitle('Välj Pronomen')
            .setDescription('Välj vilka pronomen du använder.')
        embed.addData(embed);
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`form-roles-pronouns-${interaction.member.id}`)
                    .setPlaceholder('Välj pronomen')
                    .setMaxValues(4)
                    .addOptions(
                        {
                            label: 'Han',
                            description: 'Välj om du använder pronomet "Han"',
                            value: pronouns.han
                        },
                        {
                            label: 'Hon',
                            description: 'Välj om du använder pronomet "Hon"',
                            value: pronouns.hon
                        },
                        {
                            label: 'Hen',
                            description: 'Välj om du använder pronomet "Hen"',
                            value: pronouns.hen
                        },
                        {
                            label: 'Den',
                            description: 'Välj om du använder pronomet "Den"',
                            value: pronouns.den
                        }
                    )
            )
        
        const next = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('form-cancel-'+channel.id)
                    .setLabel('Avbryt')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('form-next-pronouns-'+interaction.channelId)
                    .setLabel('Nästa')
                    .setStyle(ButtonStyle.Success),
                

            )
        
        await interaction.update({ components: [row, next], embeds: [embed] });

    }
}