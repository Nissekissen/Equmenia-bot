const fs = require('node:fs')
const { Client, Collection, EmbedBuilder, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('../config.json');
const CronJob = require('cron').CronJob
const axios = require('axios');
const { logToFile } = require('./utils/consoleLogging');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
	presence: {
		status: 'online',
		activities: [{
			name: 'Bible: Audio Book',
			type: ActivityType.Listening
		}]
	}
});
client.commands = new Collection();

const loadCommands = () => {
	const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	}
}

const loadEvents = () => {
	const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('js'))

	for (const file of eventFiles) {
		const event = require(`./events/${file}`)
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args))
		} else {
			client.on(event.name, (...args) => event.execute(...args))
		}
	}
}

let job = new CronJob('00 00 06 * * *', () => {
	axios.get('https://www.bibeln.se/pren/syndikering.jsp')
		.then((response) => {
			let bibelordData = response.data.toString().split('<p>')[1]
			let bibelord = bibelordData.split('</p>')[0]
			bibelord = bibelord.replace('<br/>', "\n")
			let versData = response.data.toString().split('">')[2]
			let vers = versData.split('</a>')[0]
			client.channels.cache.get('936214759915814954').send({ embeds: [
				new EmbedBuilder()
					.setTitle('Dagens Bibelord')
					.setDescription(bibelord)
					.setFooter({text: vers})
					.setColor('#8C3C8D')
					.setThumbnail('https://i.imgur.com/iUUOiu9.png')
					.setTimestamp(Date.now())
			] })
			logToFile("Sent dagens bibelord "+vers)
		})
}, null, true, 'Europe/Stockholm')
job.start()
loadCommands();
loadEvents();

client.login(token);
