const { SlashCommandBuilder, ChannelType, IntegrationApplication, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
require('../utils/embedData')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendmessage')
        .setDescription('Skicka ett meddelande med en knapp för att starta formuläret.')
        .addChannelOption(option => 
            option.setName('kanal')
                .setDescription('Vilken kanal meddelandet ska skickas i.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)    
        )
        .addStringOption(option => 
            option.setName('titel')
                .setDescription('Meddelandets titel')
                .setRequired(true)    
        )
        .addStringOption(option =>
            option.setName('innehåll')
                .setDescription('Meddelandets innehåll.')
                .setRequired(true)    
        ),
    execute: async interaction => {
        const embed = new EmbedBuilder()
            .setTitle(interaction.options.getString('titel'))
            .setDescription(interaction.options.getString('innehåll'))
        embed.addData(embed);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('startForm')
                    .setLabel('Börja')
                    .setStyle(ButtonStyle.Success)
            )
        await interaction.options.getChannel('kanal').send({ embeds: [embed], components: [row] });
        
        await interaction.reply({ content: `Meddelande skickat i <#${interaction.options.getChannel('kanal').id}>`, ephemeral: true });
    }
}