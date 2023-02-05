const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const fs = require('fs');

const { lärjungar } = require('../../roles.json')

module.exports = {
    builder: new ButtonBuilder()
        .setCustomId('startForm')
        .setLabel('Börja')
        .setStyle(ButtonStyle.Success),
    async execute(interaction) {
        if (interaction.member.roles.cache.has(lärjungar)) {
            return await interaction.reply({ content: 'Du kan inte fylla i det här formuläret igen.', ephemeral: true })
        }
        const category = interaction.guild.channels.cache.find(channel => channel.type === ChannelType.GuildCategory && channel.name == 'formulär');
        let channel = interaction.guild.channels.cache.find(channel => channel.name == `${interaction.member.user.username}-${interaction.member.id}`)
        const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
        let isValid = true;
        let id;
        for (const activeChannel of activeChannels.channels) {
            if (activeChannel.userId == interaction.member.id) {
                isValid = false;
                id = activeChannel.channelId;
                break;
            }
        }
        if (!channel && isValid) {
            category.children.create({
                name: `${interaction.member.user.username} ${interaction.member.id}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    }
                ]
            }).then(channel => {
                const formStart = require('../form/start');
                formStart.execute(channel, interaction.member);
                interaction.deferUpdate();
            })
        } else {
            return await interaction.reply({ content: `Du har redan ett öppet formulär: <#${id}>`, ephemeral: true });
        }
    }
}