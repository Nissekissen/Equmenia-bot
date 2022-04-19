const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios')
const { Permissions, MessageEmbed } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bibelord')
        .setDescription('Visar dagens bibelord'),
    permissions: [ Permissions.FLAGS.VIEW_CHANNEL ],
    async execute(interaction) {
        axios.get('https://www.bibeln.se/pren/syndikering.jsp')
		.then((response) => {
			console.log(response)
			let bibelordData = response.data.toString().split('<p>')[1]
			let bibelord = bibelordData.split('</p>')[0]
			let versData = response.data.toString().split('">')[2]
			let vers = versData.split('</a>')[0]
			interaction.reply({ content: 'Här är dagens bibelord:',embeds: [
				new MessageEmbed()
					.setTitle('Dagens Bibelord')
					.setDescription(bibelord)
					.setFooter(vers)
					.setColor('#8C3C8D')
					.setThumbnail('https://i.imgur.com/iUUOiu9.png')
					.setTimestamp(Date.now())
			], ephemeral: true })
		})
    }
}