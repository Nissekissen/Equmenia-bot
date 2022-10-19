const { ActivityType } = require('discord.js')
const Tags = require('../index.js')

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('Bot is ready!')
        client.user.setPresence({ activities: [{ name: 'to Bible: Audio Book' , type: ActivityType.Listening}], status: 'online' })
        console.log("Set status")
    }
}