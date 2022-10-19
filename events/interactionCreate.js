const { IntegrationApplication, InteractionType, InteractionCollector, ChannelType, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require('fs')
const { lärjungar } = require('../roles.json')
require('../utils/embedData')

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
                console.log(error);
            }
        } else if (interaction.type === InteractionType.MessageComponent) {
            let channel = interaction.guild.channels.cache.find(channel => channel.name == `${interaction.member.user.username}`)
            if (interaction.customId.startsWith('form-start')) {
                const region = require('../form/region');
                const channel = interaction.guild.channels.cache.get(interaction.customId.split("-")[2]);
                await region.execute(interaction, channel);
            } else if (interaction.customId.startsWith('startForm')) {
                if (interaction.member.roles.cache.has(lärjungar)) {
                    return await interaction.reply({ content: 'Du kan inte fylla i det här formuläret igen.', ephemeral: true })
                }
                const category = interaction.guild.channels.cache.find(channel => channel.type === ChannelType.GuildCategory && channel.name == 'formulär');
                let channel = interaction.guild.channels.cache.find(channel => channel.name == `${interaction.member.user.username}-${interaction.member.id}`)
                const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
                let isValid = true;
                let id;
                for (const activeChannel of activeChannels.channels) {
                    if (activeChannel.userId == interaction.member.id) {
                        isValid = false;
                        id = activeChannel.channelId;
                        break;
                    }
                }
                if (!channel && isValid) {
                    category.children.create({
                        name: `${interaction.member.user.username} ${interaction.member.id}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel]
                            }
                        ]
                    }).then(channel => {
                        const formStart = require('../form/start');
                        formStart.execute(channel, interaction.member);
                        interaction.deferUpdate();
                    })
                } else {
                    return await interaction.reply({ content: `Du har redan ett öppet formulär: <#${id}>`, ephemeral: true });
                }

            } else if (interaction.customId.startsWith('form-cancel')) {
                const channel = interaction.guild.channels.cache.get(interaction.customId.split("-")[2]);
                await channel.delete();
                const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
                const index = activeChannels.channels.findIndex(channelData => channelData.channelId == channel.id);
                activeChannels.channels.splice(index, 1);
                fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));
            } else if (interaction.customId.startsWith('form-next')) {
                const oldFormName = interaction.customId.split("-")[2];
                let formName;
                switch (oldFormName) {
                    case "start":
                        formName = 'region'
                        break;
                    case "region":
                        formName = 'pronomen'
                        break;
                    case "pronouns":
                        formName = 'games'
                        break;
                    case "games":
                        formName = 'intro'
                        break;
                }
                const form = require(`../form/${formName}`);
                const channel = interaction.guild.channels.cache.get(interaction.customId.split("-")[3]);
                await form.execute(interaction, channel);
            } else if (interaction.customId.startsWith('form-roles')) {
                interaction.component.options.forEach(async option => {
                    if (!isNaN(option.value)) {
                        const role = interaction.message.guild.roles.cache.find(r => r.id == option.value);
                        if (role != undefined && interaction.values.findIndex(v => v == role.id) == -1) {
                            await interaction.member.roles.remove(role);
                        }
                    }
                })
                interaction.values.forEach(async value => {
                    if (!isNaN(value)) {
                        const role = interaction.message.guild.roles.cache.find(r => r.id === value)
                        if (role != undefined) {
                            await interaction.member.roles.add(role)
                        }
                    }
                })

                await interaction.deferUpdate();
            } else if (interaction.customId.startsWith('form-submit')) {
                const channel = interaction.guild.channels.cache.get(interaction.customId.split("-")[2]);
                const data = channel.messages.fetch(interaction.customId.split("-")[3]).then(async content => {
                    const submit = require('../form/submit');
                    await submit.execute(interaction, channel, content.content, content);
                })

            } else if (interaction.customId.startsWith('form-accept')) {
                const channel = interaction.guild.channels.cache.get(interaction.customId.split("-")[2]);
                const content = channel.messages.cache.get(interaction.customId.split("-")[4]);
                const notesChannel = interaction.guild.channels.cache.find(c => c.name === "notes");
                //await notesChannel.send(`.note <@${interaction.customId.split("-")[3]}> ${content}`);
                //await notesChannel.send(`/notes user:@REEEEEEEboi#6089`);

                await channel.delete();
                await interaction.reply({ content: `Medlem godkänd. Skriv \`.note <@${interaction.customId.split("-")[3]}> ${content}\` i <#${notesChannel.id}>`, ephemeral: true });
                await interaction.message.delete();
                const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
                const index = activeChannels.channels.findIndex(channelData => channelData.channelId == channel.id);
                activeChannels.channels.splice(index, 1);
                fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));

                const member = interaction.guild.members.cache.get(interaction.customId.split("-")[3]);
                const role = interaction.guild.roles.cache.get(lärjungar);
                if (role != undefined) await member.roles.add(role);

                const embed = new EmbedBuilder()
                    .setTitle('Välkommen till Equmenia Gaming')
                    .setDescription('Välkommen till Equmenia Gamings discordserver! Du har nu blivit insläppt och har tillgång till alla kanaler! Du kan alltid meddela en online ledare om du har några frågor, alternativt fråga i någon av de passande textkanalerna. Välkommen!')
                embed.addData(embed)
                if (!interaction.member.dmChannel) await interaction.member.createDM();
                await interaction.member.dmChannel.send({ embeds: [embed] })
                
            } else if (interaction.customId.startsWith('form-deny')) {
                const channel = interaction.guild.channels.cache.get(interaction.customId.split("-")[2]);

                await channel.delete();
                await interaction.reply({ content: `Medlem avböjd, formulär borttaget.`, ephemeral: true })
                await interaction.message.delete();

                const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
                const index = activeChannels.channels.findIndex(channelData => channelData.channelId == channel.id);
                activeChannels.channels.splice(index, 1);
                fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));

                const embed = new EmbedBuilder()
                    .setTitle('Equmenia Gaming')
                    .setDescription('Ditt formulär har blivit nekat. Kontakta en ledare för mer information.')
                embed.addData(embed)
                if (!interaction.member.dmChannel) await interaction.member.createDM();
                await interaction.member.dmChannel.send({ embeds: [embed] })

            } else if (interaction.customId.startsWith('form-rewrite-intro')) {
                const channel = interaction.guild.channels.cache.get(interaction.customId.split("-")[3]);
                const messages = channel.messages.cache.last(2);
                messages.forEach(async message => await message.delete());
                const activeChannels = JSON.parse(fs.readFileSync('./channels.json'));
                activeChannels.channels.find(v => v.channelId == interaction.customId.split("-")[3]).intro = true;
                fs.writeFileSync('./channels.json', JSON.stringify(activeChannels));
            } else if (!isNaN(interaction.customId)) {
                if (interaction.member.roles.cache.some(r => r.id === interaction.customId)) {
                    const role = interaction.message.guild.roles.cache.find(r => r.id === interaction.customId)
                    await interaction.member.roles.remove(role)
                
                    await interaction.reply({
                        content: `Tog bort rollen <@&${role.id}> från <@${interaction.user.id}>`,
                        ephemeral: true
                    })
                } else {
                    const role = interaction.message.guild.roles.cache.find(r => r.id === interaction.customId)
                    await interaction.member.roles.add(role)
                    
                    await interaction.reply({
                        content: `Gav <@${interaction.user.id}> rollen <@&${role.id}>`,
                        ephemeral: true
                    })
                }
            }
        }
    }
}