const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const fs = require('fs')
require('../utils/embedData')
module.exports = {
    execute: async (interaction, channel) => {
        const embed = new EmbedBuilder()
            .setTitle('Berätta lite om dig själv')
            .setDescription('Skriv här nedan kortfattat lite om dig själv. Saker att ta med kan vara namn, ålder, vilken förening du tillhör, andra intressen, m.m. Detta är för att vi ska kunna skapa en säker miljö för alla våra medlemmar.')
        embed.addData(embed);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('form-cancel-'+channel.id)
                    .setLabel('Avbryt')
                    .setStyle(ButtonStyle.Danger)
            )

        const data = JSON.parse(fs.readFileSync('./channels.json'));

        data.channels.find(channelData => channelData.channelId == channel.id).intro = true;
        fs.writeFileSync('./channels.json', JSON.stringify(data));
        
        await interaction.update({ components: [row], embeds: [embed] });
    }
}