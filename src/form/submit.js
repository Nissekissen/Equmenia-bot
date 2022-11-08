const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { modchannel } = require('../../roles.json');

const formRewriteIntro = require('../buttons/form-rewrite-intro');
const formSubmit = require('../buttons/form-submit');
const formDeny = require('../buttons/form-deny');
const formAccept = require('../buttons/form-accept')

require('../utils/embedData')

module.exports = {
    async execute(interaction, channel, data, message) {
        const modChannel = interaction.guild.channels.cache.get(modchannel);
        const embed = new EmbedBuilder()
            .setTitle(`Formulär - ${interaction.member.user.username}`)
            .setDescription(`Inkommande formulär från \`${interaction.member.user.username}\`:\n\n${data}`)
            .setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
        embed.addData(embed, true);
        const row = new ActionRowBuilder()
            .addComponents(formDeny.builder, formAccept.builder)
        
        await modChannel.send({ embeds: [embed], components: [row] });
        
        const replyEmbed = new EmbedBuilder()
            .setTitle('Formulär mottaget')
            .setDescription('Ditt formulär har nu blivit mottaget och du kommer så snart som möjligt bli insläppt till servern. Om du har ytterligare frågor kan du skicka ett meddelande till någon av våra aktiva ledare, så hjälper dem dig.')
        replyEmbed.addData(replyEmbed)
        await interaction.update({ components: [new ActionRowBuilder().setComponents(formRewriteIntro.builder.setDisabled(true), formSubmit.builder.setDisabled(true))] })
        await interaction.channel.send({embeds: [replyEmbed]});
    }
}