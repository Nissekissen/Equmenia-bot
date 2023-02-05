const { getVoiceConnection } = require("@discordjs/voice");
const ffmpeg = require("ffmpeg");
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs')

module.exports = {
    name: 'stageInstanceDelete',
    async execute(instance) {
        const connection = getVoiceConnection(instance.guild.id);
        connection.receiver.subscriptions.delete('voiceTest')
        const files = fs.readdirSync('./recordings/');
        console.log(files)
        // for (const file of files) {
        //     const process = new ffmpeg(`./recordings/${file}`);
        //     process.then(audio => {
        //         audio.fnExtractSoundToMP3(`./recordings/${file.split('.')[0]}.mp3`, async (error, file) => {
        //             if (!error) { console.log('Successfully wrote to file!') }
        //         })
        //     }, console.log)
        //     fs.rmSync(`./recordings/${file}`);
        // }
    }
}