const {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");
const formDeny = require("./form-deny");

const { lärjungar } = require("../../roles.json");
const addData = require("../utils/embedData");

module.exports = {
    builder: new ButtonBuilder()
        .setCustomId("form-accept")
        .setLabel("Godkänn")
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),
    async execute(interaction) {
        const channelData = JSON.parse(fs.readFileSync("./channels.json"));

        const memberId = interaction.customId.split("-")[2];
        const member = await interaction.guild.members.fetch(memberId);
        const memberData = channelData.channels.find(
            (data) => data.userId == memberId
        );

        const fields = interaction.message.embeds[0].fields;

        let content = "";
        for (const field of fields) {
            content += `**${field.name}**: ${field.value}`;
            if (fields.indexOf(field) >= fields.length - 1) continue;
            content += "\n";
        }

        const channel = interaction.guild.channels.cache.get(
            memberData.channelId
        );
        const notesChannel = interaction.guild.channels.cache.find(
            (c) => c.name === "notes"
        );

        const modEmbed = EmbedBuilder.from(
            interaction.message.embeds[0].toJSON()
        );
        modEmbed.setFooter({ text: `Godkänt av ${interaction.user.username}` });

        const modRow = ActionRowBuilder.from(
            interaction.message.components[0].toJSON()
        );
        for (const com of modRow.components) com.setDisabled(true);

        const dmEmbed = new EmbedBuilder()
            .setTitle("Välkommen till Equmenia Gaming")
            .setDescription(
                "Välkommen till Equmenia Gamings discordserver! Du har nu blivit insläppt och har tillgång till alla kanaler! Du kan alltid meddela en online ledare om du har några frågor, alternativt fråga i någon av de passande textkanalerna. Välkommen!"
            );
        addData(dmEmbed);

        if (!member.dmChannel) await member.createDM();
        await member.dmChannel.send({ embeds: [dmEmbed] });

        await channel.delete();
        await interaction.reply({
            content: `Medlem godkänd. Skriv följande meddelande i <#${notesChannel.id}>:`,
            ephemeral: true,
        });
        await interaction.followUp({
            content: `\`.note <@${member.id}> ${content}\``,
            ephemeral: true,
        });
        await interaction.message.edit({
            embeds: [modEmbed],
            components: [modRow],
        });

        const i = channelData.channels.findIndex(
            (c) => c.channelId == channel.id
        );
        channelData.channels.splice(i, 1);
        fs.writeFileSync("./channels.json", JSON.stringify(channelData));

        const role = interaction.guild.roles.cache.get(lärjungar);
        if (role != undefined) await member.roles.add(role);
    },
};
