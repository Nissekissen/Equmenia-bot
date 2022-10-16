const Tags = require('../index.js')

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('Bot started')
        client.user.setPresence({ activities: [{ name: 'Jesaja 28:10' , type: 'WATCHING'}], status: 'online' })
    }
}