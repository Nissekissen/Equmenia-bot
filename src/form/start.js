const { ButtonBuilder } = require("@discordjs/builders");
const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, IntegrationApplication, ButtonStyle } = require("discord.js");
const fs = require('fs');
const formCancel = require("../buttons/form-cancel.js");
const formNext = require("../buttons/form-next.js");
require('../utils/embedData.js')

module.exports = {
    async execute(channel, member) {
        const embed = new EmbedBuilder()
            .setTitle('Välkommen till Equmenia Gaming!')
            .setDescription('Varmt välkommen till Equmenia Gamings discordserver. Här kommer ett kort litet formulär för att få tillgång till servern. Detta är för att vi ska kunna skapa en säker miljö för alla våra medlemmar. Hoppas att du ska trivas med oss och hör gärna av dig till oss om du har några frågor!')
        embed.addData(embed);

        const row = new ActionRowBuilder()
            .addComponents(
                formCancel.builder,
                formNext.builder,
                
            );
        
        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));

        const userData = {
            channelId: channel.id,
            userId: member.id,
            username: member.user.tag,
            intro: false,
            currentForm: 'start'
        }
        activeChannels.channels.push(userData);
        fs.writeFileSync('./channels.json', JSON.stringify(activeChannels))
        await channel.send({embeds: [embed], components: [row]});
    }
}