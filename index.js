const fs = require('node:fs')
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const CronJob = require('cron').CronJob

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

let job = new CronJob('00 33 17 * * *', () => {
	console.log("Changed status")
}, null, true, 'Europe/Stockholm')
job.start()
loadCommands();
loadEvents();

client.login(token);