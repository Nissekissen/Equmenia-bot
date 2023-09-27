const {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
} = require("discord.js");
const fs = require("fs");

const { modchannel } = require("../../roles.json");
const formDeny = require("./form-deny");
const formAccept = require("./form-accept");
const addData = require("../utils/embedData");

module.exports = {
    builder: new ButtonBuilder()
        .setLabel("Skicka")
        .setCustomId("intro_modal_submit")
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),
    async execute(interaction) {
        const modChannel = await interaction.guild.channels.fetch(modchannel);

        const modEmbed = new EmbedBuilder()
            .setTitle(`Formulär - ${interaction.member.user.username}`)
            .setDescription(
                `Inkommande formulär från \`${interaction.member.user.username}\`:`
            )
            .addFields(
                {
                    name: "Namn: ",
                    value: interaction.fields.getField("namn").value,
                },
                {
                    name: "Ålder: ",
                    value: interaction.fields.getField("ålder").value,
                },
                {
                    name: "Förening: ",
                    value: interaction.fields.getField("förening").value,
                },
                {
                    name: "Intressen: ",
                    value: interaction.fields.getField("intressen").value,
                }
            )
            .setThumbnail(
                interaction.member.user.displayAvatarURL({ dynamic: true })
            );
        addData(modEmbed, true);

        const denyBtn = ButtonBuilder.from(formDeny.builder.toJSON());
        const acceptBtn = ButtonBuilder.from(formAccept.builder.toJSON());

        const modRow = new ActionRowBuilder().addComponents(
            denyBtn
                .setDisabled(false)
                .setCustomId(`form-deny-${interaction.user.id}`),
            acceptBtn
                .setDisabled(false)
                .setCustomId(`form-accept-${interaction.user.id}`)
        );

        const formEmbed = new EmbedBuilder()
            .setTitle("Formulär mottaget")
            .setDescription(
                "Ditt formulär har nu blivit mottaget och du kommer så snart som möjligt bli insläppt till servern. Om du har ytterligare frågor kan du skicka ett meddelande till någon av våra aktiva ledare, så hjälper dem dig."
            );
        addData(formEmbed);

        // Disable all buttons in form channel

        await interaction.update({ embeds: [formEmbed], components: [] });
        await modChannel.send({ embeds: [modEmbed], components: [modRow] });
    },
};
