const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const fs = require('fs');
const formDeny = require("./form-deny");

const { lärjungar } = require('../../roles.json')

module.exports = {
    builder: new ButtonBuilder()
        .setCustomId('form-accept')
        .setLabel('Godkänn')
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),
    async execute(interaction) {
        const memberName = interaction.message.embeds[0].description.split('`')[1]
        const member = interaction.guild.members.cache.find(user => user.user.username === memberName)
        const channelData = JSON.parse(fs.readFileSync('./channels.json'));
        const userData = channelData.channels.find(data => data.userId == member.id);
        const channel = interaction.guild.channels.cache.get(userData.channelId);
        const content = interaction.message.embeds[0].description.split('\n')[2];
        const notesChannel = interaction.guild.channels.cache.find(c => c.name === "notes");

        await channel.delete();
        await interaction.reply({ content: `Medlem godkänd. Skriv \`.note <@${member.id}> ${content}\` i <#${notesChannel.id}>`, ephemeral: true });
        const old_embed = interaction.message.embeds[0]
        const new_embed = new EmbedBuilder()
            .setTitle(old_embed.title)
            .setDescription(old_embed.description)
            .setFooter({ text: `Godkänt av ${interaction.member.user.username}` })
            .setThumbnail(old_embed.thumbnail.url)
        new_embed.addData(new_embed, true)
        const row = new ActionRowBuilder()
            .addComponents(
                formDeny.builder.setDisabled(true),
                this.builder.setDisabled(true),
            )

        await interaction.message.edit({ embeds: [new_embed], components: [row] })

        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
        const index = activeChannels.channels.findIndex(channelData => channelData.channelId == channel.id);
        activeChannels.channels.splice(index, 1);
        fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));
        const role = interaction.guild.roles.cache.get(lärjungar);
        if (role != undefined) await member.roles.add(role);

        const embed = new EmbedBuilder()
            .setTitle('Välkommen till Equmenia Gaming')
            .setDescription('Välkommen till Equmenia Gamings discordserver! Du har nu blivit insläppt och har tillgång till alla kanaler! Du kan alltid meddela en online ledare om du har några frågor, alternativt fråga i någon av de passande textkanalerna. Välkommen!')
        embed.addData(embed)
        if (!member.dmChannel) await member.createDM();
        await member.dmChannel.send({ embeds: [embed] })
    }
}