const {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
    SelectMenuComponent,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
} = require("discord.js");
const fs = require("fs");
const { sections } = require("../../forms.json");
const openModal = require("./open-modal");

const formCancel = require("./form-cancel");

const addData = require("../utils/embedData");

module.exports = {
    builder: new ButtonBuilder()
        .setLabel("Nästa")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("form-next"),
    async execute(interaction) {
        const activeChannels = JSON.parse(fs.readFileSync("./channels.json"));
        const nextFormId =
            activeChannels.channels.find(
                (data) => data.channelId === interaction.channel.id
            ).sectionId + 1;
        const nextForm = sections.find((obj) => obj.id === nextFormId);

        const embed = new EmbedBuilder()
            .setTitle(nextForm.title)
            .setDescription(nextForm.text);
        addData(embed);

        const actionRow = new ActionRowBuilder();
        const btnRow = new ActionRowBuilder().addComponents(
            interaction.message.components[interaction.message.components.length-2].components[0],
            this.builder
        );
        const cancelRow = new ActionRowBuilder().addComponents(
            formCancel.builder
        );

        if (nextForm.image != undefined) {
            embed.setImage(nextForm.image.url);
        }

        if (nextForm.type == "select") {
            actionRow.addComponents(
                StringSelectMenuBuilder.from(nextForm.menu)
            );
        } else if (nextForm.type == "modal") {
            btnRow.components[1] = openModal.builder;
        }

        activeChannels.channels.find(
            (data) => data.channelId === interaction.channel.id
        ).sectionId = nextFormId;
        fs.writeFileSync("./channels.json", JSON.stringify(activeChannels));

        console.log(cancelRow);

        await interaction.update({
            embeds: [embed],
            components:
                actionRow.components.length > 0
                    ? [actionRow, btnRow, cancelRow]
                    : [btnRow, cancelRow],
        });
    },
};
