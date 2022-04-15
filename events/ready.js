const Tags = require('../index.js')

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log('Bot is ready!')
    }
}