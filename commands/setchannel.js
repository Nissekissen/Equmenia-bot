const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const fs = require('fs');
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Set the channel for the forms to show up in.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.addChannelTypes(ChannelType.GuildText) 
                .setName('channel')
                .setDescription('The channel')
                .setRequired(true)   
        ),
    execute: async interaction => {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../roles.json')));
        const channel = interaction.options.getChannel('channel');
        data.modchannel = channel.id;
        fs.writeFileSync(path.join(__dirname, '../roles.json'), JSON.stringify(data));
        await interaction.reply({
            content: `Mod channel set to <#${channel.id}>`,
            ephemeral: true
        });
    }
}