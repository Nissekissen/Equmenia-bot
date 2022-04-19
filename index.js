const fs = require('node:fs')
const { Client, Collection, Intents, MessageEmbed, EmbedFooterData } = require('discord.js');
const { token } = require('./config.json');
const CronJob = require('cron').CronJob
const axios = require('axios')

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const loadCommands = () => {
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    console.log(commandFiles)
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	}
}

const loadEvents = () => {
	const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('js'))

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
			console.log(response)
			let bibelordData = response.data.toString().split('<p>')[1]
			let bibelord = bibelordData.split('</p>')[0]
			let versData = response.data.toString().split('">')[2]
			let vers = versData.split('</a>')[0]
			client.channels.cache.get('405739420285665284').send({ embeds: [
				new MessageEmbed()
					.setTitle('Dagens Bibelord')
					.setDescription(bibelord)
					.setFooter(vers)
					.setColor('#8C3C8D')
					.setThumbnail('https://i.imgur.com/iUUOiu9.png')
					.setTimestamp(Date.now())
			] })
		})
}, null, true, 'Europe/Stockholm')
job.start()
loadCommands();
loadEvents();

client.login(token);