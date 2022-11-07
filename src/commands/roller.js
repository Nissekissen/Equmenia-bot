const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')
const { notDeepEqual } = require('node:assert')
const fs = require('node:fs')
const { writeToFile, deleteFile, clearFile, readFile } = require('../utils/fileUtils')
const convertUtils = require('../utils/converter')
const client = require('rest/client')
const { logToFile } = require('../utils/consoleLogging')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roller')
        .setDescription('Reaktions roller')
        .addSubcommand(subcommand => 
            subcommand
                .setName('skapa')
                .setDescription('Skapa ett meddelande')
                .addStringOption(option =>
                    option.setName('namn')
                        .setDescription('Meddelandes namn/titel')
                        .setRequired(true)
                )
                .addChannelOption(option => 
                    option.setName('kanal')
                        .setDescription('Meddelandes kanal')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('innehåll')
                        .setDescription('Meddelandets innehåll.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lägg_till')
                .setDescription('Lägg till en roll')
                .addStringOption(option =>
                    option.setName('namn').setDescription('Meddelandets namn/titel').setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('emoji').setDescription('Emojin').setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('titel').setDescription('Titeln på reaktionen').setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('roll').setDescription('Rollen som ska ges ut').setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ta_bort')
                .setDescription('Ta bort en roll')
                .addStringOption(option =>
                    option.setName('namn').setDescription('Meddelandets namn/titel').setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('roll').setDescription('Rollen som ska tas bort').setRequired(true)
                )
        ),
    execute: async interaction => {
        if (interaction.options.getSubcommand() === 'skapa') {
            logToFile(interaction.user.name + ' ran command "/roller skapa"')
            const embed = new EmbedBuilder()
                .setTitle(interaction.options.get('namn').value)
                .setDescription(interaction.options.get('innehåll').value)
                .setColor('#8C3C8D')
            
            const channel = interaction.client.channels.cache.get(interaction.options.get('kanal').value)
            

            if (!fs.existsSync(`./messages/${interaction.options.get('namn').value}`)) {
                let message = await channel.send({ embeds: [embed] })
                
                fs.mkdirSync(`./messages/${interaction.options.get('namn').value}`)

                writeToFile(`./messages/${interaction.options.get('namn').value}/message.txt`, message.id.toString())

                writeToFile(`./messages/${interaction.options.get('namn').value}/channel.txt`, interaction.options.get('kanal').value)

                await interaction.reply({ content: `Message sent in <#${interaction.options.get('kanal').value}>`, ephemeral: true })
            } else {
                await interaction.reply({ content: `A message with the name "${interaction.options.get('namn').value}" already exists!`, ephemeral: true })
            }
        } else if (interaction.options.getSubcommand() === 'lägg_till') {
            logToFile(interaction.user.name + ' ran command "/roller lägg_till"')
            if (!fs.existsSync(`./messages/${interaction.options.get('namn').value}`)) {
                interaction.reply(`Hittade inget meddelande med namnet "${interaction.options.get('namn').value}"`)
                return
            }

            const message_id = readFile(`./messages/${interaction.options.get('namn').value}/message.txt`)

            const channel_id = readFile(`./messages/${interaction.options.get('namn').value}/channel.txt`)
            interaction.client.channels.cache.get(channel_id).messages.fetch(message_id).then(message => {
                if (message.components.length == 0) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(interaction.options.get('emoji').value)
                                .setCustomId(interaction.options.get('roll').value)
                                .setLabel(interaction.options.get('titel').value)
                        )
                    message.edit({components: [row]})
                } else {
                    
                    let components = message.components
                    if (components[components.length-1].components.length == 5) {
                        components.push(new ActionRowBuilder())
                    }
                    components[components.length-1].addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(interaction.options.get('emoji').value)
                            .setCustomId(interaction.options.get('roll').value)
                            .setLabel(interaction.options.get('titel').value)
                    )
                    message.edit({components: components})
                }
                
            })

            interaction.reply({ content: `Lade till reaktionen "${interaction.options.get('titel').value}" på meddelandet "${interaction.options.get('namn').value}"`, ephemeral: true})
        } else if (interaction.options.getSubcommand() === 'ta_bort') {
            logToFile(interaction.user.name + ' ran command "/roller ta_bort"')
            if (!fs.existsSync(`./messages/${interaction.options.get('namn').value}/message.txt`)) {
                interaction.reply(`Hittade inget meddelande med namnet "${interactio.options.get('namn').value}"`)
                return
            }

            const message_id = readFile(`./messages/${interaction.options.get('namn').value}/message.txt`)
            const channel_id = readFile(`./messages/${interaction.options.get('namn').value}/channel.txt`)
            interaction.client.channels.cache.get(channel_id).messages.fetch(message_id).then(message => {
                if (message.components.length == 0) {
                    interaction.reply("Meddelandet har inga reaktioner.")
                    return
                } else {
                    let newComponents = convertUtils.rowsToList(message.components)
                    for (let i = 0; i < newComponents.length; i++) {
                        if (newComponents[i].customId === interaction.options.get('roll').value) {
                            newComponents.splice(i, 1)
                            interaction.reply({content: `Tog bort rollen <@&${interaction.options.get('roll').value}>`, ephemeral: true})
                            break
                        } 
                    }
                    let com = convertUtils.listToRows(newComponents)
                    message.edit({components: com})
                }
            })

        }
    }
}