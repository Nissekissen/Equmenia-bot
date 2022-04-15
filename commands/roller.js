const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { notDeepEqual } = require('node:assert')
const fs = require('node:fs')
const { writeToFile, deleteFile, clearFile, readFile } = require('../utils/fileUtils')

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
    async execute(interaction) {
        //console.log(interaction.options)
        if (interaction.options.getSubcommand() === 'skapa') {
            const embed = new MessageEmbed()
                .setTitle(interaction.options.get('namn').value)
                .setDescription(interaction.options.get('innehåll').value)
                .setColor('#8C3C8D')
            
            console.log(interaction.options.get('kanal').value)
            
            /*
            
            [
                {
                    name: "something",
                    channel: "channel-id"
                    message: "message-id"
                    reactions: [
                        {
                            name: "something2"
                            emoji: "some-emoji"
                            role: "role-id"
                        },
                        {
                            name: "something3"
                            emoji: "some-emoji2"
                            role: "role-id2"
                        } 
                    ]
                }
            ]
            
            
            */
            

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
            
            const message_id = readFile(`./messages/${interaction.options.get('namn').value}/message.txt`)

            const channel_id = readFile(`./messages/${interaction.options.get('namn').value}/channel.txt`)
            
            interaction.channel.messages.fetch(message_id).then(message => {
                if (message.components.length == 0) {
                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setStyle('PRIMARY')
                                .setEmoji(interaction.options.get('emoji').value)
                                .setCustomId(interaction.options.get('roll').value)
                                .setLabel(interaction.options.get('titel').value)
                        )
                    message.edit({components: [row]})
                } else {
                    let components = message.components
                    components[components.length-1].addComponents(
                        new MessageButton()
                            .setStyle('PRIMARY')
                            .setEmoji(interaction.options.get('emoji').value)
                            .setCustomId(interaction.options.get('roll').value)
                            .setLabel(interaction.options.get('titel').value)
                    )
                    message.edit({components: components})
                }
                
            })

            interaction.reply({ content: `Lade till reaktionen "${interaction.options.get('titel').value}" på meddelandet "${interaction.options.get('namn').value}"`, ephemeral: true})
        } else if (interaction.options.getSubcommand() === 'ta_bort') {

            const message_id = readFile(`./messages/${interaction.options.get('namn').value}/message.txt`)

            interaction.channel.messages.fetch(message_id).then(message => {

            })

        }
    }
}