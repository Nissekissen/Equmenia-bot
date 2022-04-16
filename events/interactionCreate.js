const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {

	        const command = interaction.client.commands.get(interaction.commandName);

	        if (!command) return;

	        try {
	        	await command.execute(interaction);
	        } catch (error) {
	        	console.error(error);
	        	await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	        }
        } else if (interaction.isButton()) {
            
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