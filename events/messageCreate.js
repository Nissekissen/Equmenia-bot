const fs = require('fs')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js')

module.exports = {
    name: 'messageCreate',
    async execute (interaction) {
        if (interaction.member.id === interaction.client.user.id) return;
        const activeChannels = JSON.parse(fs.readFileSync(`./channels.json`));
        const returnChannels = activeChannels;
        for (channel of activeChannels.channels) {
            if (interaction.channelId == channel.channelId) {
                if (interaction.member.id == channel.userId && channel.intro) {
                    const next = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`form-rewrite-intro-${interaction.channelId}-${interaction.id}`)
                                .setLabel('Skriv om')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId(`form-submit-${interaction.channelId}-${interaction.id}`)
                                .setLabel('Skicka')
                                .setStyle(ButtonStyle.Success)
                        )
                    await interaction.channel.send({ components: [next] });
                    returnChannels.channels.find(v => v.channelId == channel.channelId).intro = false;
                    break;
                } else {
                    await interaction.delete();
                }
            }
        }
        fs.writeFileSync(`./channels.json`, JSON.stringify(returnChannels));
    }
}