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
const formNext = require("./form-next");
const formCancel = require("./form-cancel");
require("../utils/embedData");

module.exports = {
    builder: new ButtonBuilder()
        .setLabel("Föregående")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("form-back"),
    async execute(interaction) {
        const activeChannels = JSON.parse(fs.readFileSync("./channels.json"));
        const nextFormId =
            activeChannels.channels.find(
                (data) => data.channelId === interaction.channel.id
            ).sectionId - 1;
        const nextForm = sections.find((obj) => obj.id === nextFormId);

        const embed = new EmbedBuilder()
            .setTitle(nextForm.title)
            .setDescription(nextForm.text);
        addData(embed);

        const nextBtn = ButtonBuilder.from(formNext.builder.toJSON());
        const cancelBtn = ButtonBuilder.from(formCancel.builder.toJSON());

        const actionRow = new ActionRowBuilder();
        const btnRow = new ActionRowBuilder().addComponents(
            this.builder,
            nextBtn
        );
        const cancelRow = new ActionRowBuilder().addComponents(
            cancelBtn
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

        await interaction.update({
            embeds: [embed],
            components:
                actionRow.components.length > 0
                    ? [actionRow, btnRow, cancelRow]
                    : [btnRow, cancelRow],
        });
    },
};
