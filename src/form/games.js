const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
require('../utils/embedData')
const { games } = require('../../roles.json')

module.exports = {
    execute: async (interaction, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Välj spel')
            .setDescription('Välj de spel du brukar spela/är intresserad av att spela.')
        embed.addData(embed)
        
        const row = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`form-roles-games-${interaction.member.id}`)
                    .setPlaceholder('Välj spel')
                    .setMaxValues(10)
                    .addOptions(
                        {
                            label: 'Minecraft',
                            description: 'Välj om du brukar spela minecraft.',
                            value: games.minecraft
                        },
                        {
                            label: 'League of Legends',
                            description: 'Välj om du brukar spela League of Legends.',
                            value: games.lol
                        },
                        {
                            label: 'CS:GO',
                            description: 'Välj om du brukar spela CS:GO.',
                            value: games.csgo
                        },
                        {
                            label: 'Fortnite',
                            description: 'Välj om du brukar spela Fortnite',
                            value: games.fortnite
                        },
                        {
                            label: 'Roblox',
                            description: 'Välj om du brukar spela roblox',
                            value: games.roblox
                        },
                        {
                            label: 'Among Us',
                            description: 'Välj om du brukar spela Among Us',
                            value: games.amongus
                        },
                        {
                            label: 'PUBG',
                            description: 'Välj om du brukar spela PUBG',
                            value: games.pubg
                        },
                        {
                            label: 'Apex Legends',
                            description: 'Välj om du brukar spela Apex Legends',
                            value: games.apex
                        },
                        {
                            label: 'Star Stable',
                            description: 'Välj om du brukar spela Star Stable',
                            value: games.starstable
                        },
                        {
                            label: 'Rocket League',
                            description: 'Välj om du brukar spela Rocket League',
                            value: games.rocketleague
                        },
                        {
                            label: 'Valorant',
                            description: 'Välj om du brukar spela Valorant',
                            value: games.valorant
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
                    .setCustomId('form-next-games-'+interaction.channelId)
                    .setLabel('Nästa')
                    .setStyle(ButtonStyle.Success),
                
            )
        
        await interaction.update({ components: [row, next], embeds: [embed] })
    }
}