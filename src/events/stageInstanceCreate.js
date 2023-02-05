const { joinVoiceChannel, entersState, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice')
const { pipeline } = require('node:stream')
const prism = require('prism-media')
const fs = require('fs')
const { ChannelType } = require('discord.js')
const path = require('node:path')

const createListeningStream = (receiver, userId) => {
    const opusStream = receiver.subscribe(userId, {
        end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 100
        },
    });

    const oggStream = new prism.opus.OggLogicalBitstream({
        opusHead: new prism.opus.OpusHead({
            channelCount: 2,
            sampleRate: 48000,
        }),
        pageSizeControl: {
            maxPackets: 10,
        }
    });

    if (!fs.existsSync(path.join(__dirname, '../../', 'recordings', userId))) fs.mkdirSync(path.join(__dirname, '../../', 'recordings', userId))
    const filename = path.join(__dirname, '../../', 'recordings', userId, `${Date.now()}.pcm`);

    // fs.truncateSync(filename)

    const out = fs.createWriteStream(filename, { flags: 'w' });

    pipeline(opusStream, oggStream, out, (err) => {
        if (err) {
            console.warn(`❌ Error recording file ${filename} - ${err.message}`);
        } else {
            console.log(`✅ Recorded ${filename}`);
        }
    });
}



module.exports = {
    name: 'stageInstanceCreate',
    async execute(instance) {

        const channel = instance.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
        const receiver = connection.receiver;
        const testUser = instance.guild.members.cache.get('405366885157306369');

        const speakers = instance.guild.members.cache.filter(member => member.voice.channel.type === ChannelType.GuildStageVoice && !member.voice.suppress);

        receiver.speaking.on('start', userId => {
            createListeningStream(receiver, userId)
        })
    }   
}