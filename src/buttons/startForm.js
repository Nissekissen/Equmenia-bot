const {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
    PermissionsBitField,
    ChannelType,
} = require("discord.js");
const fs = require("fs");

const { sections } = require("../../forms.json");

const { lärjungar } = require("../../roles.json");
const formCancel = require("./form-cancel");
const formNext = require("./form-next");
const formBack = require("./form-back");
const addData = require("../utils/embedData");

module.exports = {
    builder: new ButtonBuilder()
        .setCustomId("startForm")
        .setLabel("Börja")
        .setStyle(ButtonStyle.Success),
    async execute(interaction) {
        if (interaction.member.roles.cache.has(lärjungar)) {
            return await interaction.reply({
                content: "Du kan inte fylla i det här formuläret igen.",
                ephemeral: true,
            });
        }
        const category = interaction.guild.channels.cache.find(
            (channel) =>
                channel.type === ChannelType.GuildCategory &&
                channel.name == "formulär"
        );
        let channel = interaction.guild.channels.cache.find(
            (channel) =>
                channel.name ==
                `${interaction.member.user.username}-${interaction.member.id}`
        );
        const activeChannels = JSON.parse(fs.readFileSync("./channels.json"));

        let isValid = true;
        let id;
        for (const activeChannel of activeChannels.channels) {
            if (activeChannel.userId == interaction.member.id) {
                isValid = false;
                id = activeChannel.channelId;
                break;
            }
        }

        if (channel && isValid) {
            await channel.delete();
            channel = null;
        }

        if (!channel && isValid) {
            channel = await category.children.create({
                name: `${interaction.member.user.username}-${interaction.member.id}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const userData = {
                channelId: channel.id,
                userId: interaction.member.id,
                username: interaction.user.tag,
                sectionId: 0,
            };

            activeChannels.channels.push(userData);
            fs.writeFileSync("./channels.json", JSON.stringify(activeChannels));

            const section = sections.find(
                (obj) => obj.id === userData.sectionId
            );

            const embed = new EmbedBuilder()
                .setTitle(section.title)
                .setDescription(section.text);
            addData(embed);

            const nextBtn =   ButtonBuilder.from(formNext.builder.toJSON());
            const backBtn =   ButtonBuilder.from(formBack.builder.toJSON());
            const cancelBtn = ButtonBuilder.from(formCancel.builder.toJSON());

            const row = new ActionRowBuilder().addComponents(
                backBtn,
                nextBtn
            );

            const row2 = new ActionRowBuilder().addComponents(
                cancelBtn
            );

            await channel.send({
                content: interaction.member.toString(),
                embeds: [embed],
                components: [row, row2],
            });

            await interaction.reply({
                content: `Ditt formulär har skapats! Se ${channel.toString()}`,
                ephemeral: true,
            });
        } else {
            return await interaction.reply({
                content: `Du har redan ett öppet formulär: <#${id}>`,
                ephemeral: true,
            });
        }
    },
};
