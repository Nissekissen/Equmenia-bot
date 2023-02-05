const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const fs = require('fs');
const formAccept = require("./form-accept");

module.exports = {
    builder: new ButtonBuilder()
        .setLabel('Avböj')
        .setCustomId('form-deny')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false),
    async execute(interaction) {
        const memberName = interaction.message.embeds[0].description.split('`')[1]
        const member = interaction.guild.members.cache.find(user => user.username === memberName)

        const channelData = JSON.parse(fs.readFileSync('./channels.json'));
        const userData = channelData.channels.findIndex(data => data.userId == member.id);

        const channel = interaction.guild.channels.cache.get(userData.channelId);

        await channel.delete();
        await interaction.reply({ content: `Medlem avböjd, formulär borttaget.`, ephemeral: true })
        const old_embed = interaction.message.embeds[0]
        const new_embed = new EmbedBuilder()
            .setTitle(old_embed.title)
            .setDescription(old_embed.description)
            .setFooter({ text: `Avböjt av ${interaction.member.user.username}` })
            .setThumbnail(old_embed.thumbnail.url)
        new_embed.addData(new_embed, true)
        const row = new ActionRowBuilder()
            .addComponents(
                formAccept.builder.setDisabled(true),
                this.builder.setDisabled(true)
            )

        await interaction.message.edit({ embeds: [new_embed], components: [row] })

        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
        const index = activeChannels.channels.findIndex(channelData => channelData.channelId == channel.id);
        activeChannels.channels.splice(index, 1);
        fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));

        const embed = new EmbedBuilder()
            .setTitle('Equmenia Gaming')
            .setDescription('Ditt formulär har blivit nekat. Kontakta en ledare för mer information.')
        embed.addData(embed)
        if (!member.dmChannel) await member.createDM();
        await member.dmChannel.send({ embeds: [embed] })
    }
}