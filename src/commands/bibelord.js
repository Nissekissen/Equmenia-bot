const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios')
const { Permissions, EmbedBuilder } = require('discord.js')
const { logToFile } = require('../utils/consoleLogging')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bibelord')
        .setDescription('Visar dagens bibelord'),
    execute: async interaction => {
        const { data } = await axios.get('https://www.bibeln.se/pren/syndikering.jsp');
		let bibelordData = data.toString().split('<p>')[1]
			let bibelord = bibelordData.split('</p>')[0]
			bibelord = bibelord.replace('<br/>', "\n")
			let versData = data.toString().split('">')[2]
			let vers = versData.split('</a>')[0]
			interaction.reply({ content: 'Här är dagens bibelord:',embeds: [
				new EmbedBuilder()
					.setTitle('Dagens Bibelord')
					.setDescription(bibelord)
					.setFooter({text: vers})
					.setColor('#8C3C8D')
					.setThumbnail('https://i.imgur.com/iUUOiu9.png')
					.setTimestamp(Date.now())
			], ephemeral: true })
    }
}