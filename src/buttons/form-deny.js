const {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
} = require("discord.js");
const fs = require("fs");
const formAccept = require("./form-accept");

module.exports = {
    builder: new ButtonBuilder()
        .setLabel("Avböj")
        .setCustomId("form-deny")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false),
    async execute(interaction) {
        const channelData = JSON.parse(fs.readFileSync("./channels.json"));

        const memberId = interaction.customId.split("-")[2];
        const member = await interaction.guild.members.fetch(memberId);
        const memberData = channelData.channels.find(
            (data) => data.userId == memberId
        );

        const channel = await interaction.guild.channels.fetch(
            memberData.channelId
        );

        const modEmbed = EmbedBuilder.from(
            interaction.message.embeds[0].toJSON()
        );
        modEmbed.setFooter({ text: `Godkänt av ${interaction.user.username}` });

        const modRow = new ActionRowBuilder().addComponents(
            this.builder.setDisabled(true),
            formAccept.builder.setDisabled(true)
        );

        

        const index = channelData.channels.findIndex(
            (c) => c.channelId == channel.id
        );
        channelData.channels.splice(index, 1);
        fs.writeFileSync("./channels.json", JSON.stringify(channelData));

        const embed = new EmbedBuilder()
            .setTitle("Equmenia Gaming")
            .setDescription(
                "Ditt formulär har blivit nekat. Kontakta en ledare för mer information."
            );
        addData(embed);
        if (!member.dmChannel) await member.createDM();
        await member.dmChannel.send({ embeds: [embed] });

        await interaction.message.edit({
            embeds: [modEmbed],
            components: [modRow],
        });

        await channel.delete();
        await interaction.reply({
            content: `Medlem avböjd, formulär borttaget.`,
            ephemeral: true,
        });
    },
};
