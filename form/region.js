const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ButtonStyle } = require('discord.js');
const { regions } = require('../roles.json')
require('../utils/embedData.js')

module.exports = {
    execute: async (interaction, channel) => {

        const embed = new EmbedBuilder()
            .setTitle('Välj region')
            .setDescription('Välj vilken/vilka regioner du tillhör. Detta kan vara antingen vilken region du bor i eller vilken region kyrkan ligger i.')
            .setImage('https://equmeniakyrkan.se/wp-content/uploads/2019/12/RegionerKarta-267x640.png')
        embed.addData(embed);
        
        
        const row = new ActionRowBuilder()
            .addComponents(new SelectMenuBuilder()
            .setCustomId(`form-roles-region-${interaction.member.id}`)
            .setPlaceholder('Välj en region')
            .addOptions(
                {
                    label: 'Region Nord',
                    description: 'Välj om du bor i region nord.',
                    value: regions.nord
                },
                {
                    label: 'Region Väst',
                    description: 'Välj om du bor i region väst.',
                    value: regions.väst
                },
                {
                    label: 'Region Mitt',
                    description: 'Välj om du bor i region mitt.',
                    value: regions.mitt
                },
                {
                    label: 'Region Stockholm',
                    description: 'Välj om du bor i region Stockholm.',
                    value: regions.sthlm
                },
                {
                    label: 'Region Öst',
                    description: 'Välj om du bor i region öst.',
                    value: regions.öst
                },
                {
                    label: 'Region Syd',
                    description: 'Välj om du bor i region syd.',
                    value: regions.syd
                },
                {
                    label: 'Region Svealand',
                    description: 'Välj om du bor i region svealand.',
                    value: regions.svea
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
                    .setCustomId('form-next-region-'+interaction.channelId)
                    .setLabel('Nästa')
                    .setStyle(ButtonStyle.Success),
                

            )
        
        await interaction.update({ components: [row, next], embeds: [embed] });
        
    }
}