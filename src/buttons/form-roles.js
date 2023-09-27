const {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require("discord.js");
const fs = require("fs");

const roles = require("../../roles.json");

module.exports = {
    builder: new SelectMenuBuilder()
        .setCustomId("roles_select")
        .setPlaceholder("Inget valt."),
    async execute(interaction) {
        
        await interaction.deferReply({ ephemeral: true });

        // Clear all available roles
        for (const option of interaction.component.options) {

            const category = interaction.customId.split("-")[1];
            const roleId = roles[category][option.value];
            const role = await interaction.guild.roles.fetch(roleId);

            if (!role) continue;

            await interaction.member.roles.remove(role);
        }

        // Add all the roles that were selected
        for (const value of interaction.values) {

            const category = interaction.customId.split("-")[1];
            const roleId = roles[category][value];
            const role = await interaction.guild.roles.fetch(roleId);
            
            if (!role) continue;

            await interaction.member.roles.add(role);
        }

        await interaction.editReply({ content: "Roller uppdaterade!", ephemeral: true})
    },
};

