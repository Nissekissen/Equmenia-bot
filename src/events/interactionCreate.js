const { IntegrationApplication, InteractionType, InteractionCollector, ChannelType, PermissionsBitField, EmbedBuilder, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require('fs')
const { lärjungar } = require('../../roles.json');
const logger = require("../utils/logger");
require('../utils/embedData')

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            // Commands
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
                logger.log(`${interaction.member.user.username} ran the command ${command.data.name}`)
            } catch (error) {
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
                logger.log(error);
            }
        } else if (interaction.type === InteractionType.MessageComponent) {

            // Reaction roles
            if (!isNaN(interaction.customId)) {
                logger.log(`${interaction.member.user.username} pressed a role button.`)
                if (interaction.member.roles.cache.some(r => r.id === interaction.customId)) {
                    const role = interaction.message.guild.roles.cache.find(r => r.id === interaction.customId)
                    await interaction.member.roles.remove(role)
                
                    await interaction.reply({
                        content: `Tog bort rollen <@&${role.id}> från <@${interaction.user.id}>`,
                        ephemeral: true
                    })
                } else {
                    const role = interaction.message.guild.roles.cache.find(r => r.id === interaction.customId)
                    await interaction.member.roles.add(role)
                    
                    await interaction.reply({
                        content: `Gav <@${interaction.user.id}> rollen <@&${role.id}>`,
                        ephemeral: true
                    })
                }
                return
            }

            // Other buttons or select menus.
            const buttonFiles = fs.readdirSync('./src/buttons').filter(file => file.endsWith('js'))
            for (const file of buttonFiles) {
                const buttonData = require(`../buttons/${file}`)
                if (interaction.customId.startsWith(buttonData.builder.data.custom_id)) {
                    logger.log(`${interaction.member.user.username} used the message component ${buttonData.builder.data.custom_id}.`)
                    return await buttonData.execute(interaction);
                }
            }
        }
    }
}