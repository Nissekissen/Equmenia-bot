const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { getChapterPart, getReadActionRow, getChapters } = require("../utils/bibelUtils");
const addData = require("../utils/embedData");
const books = require("../../books.json");

module.exports = {
    async execute(interaction) {
        let [_, book, chapter, page] = interaction.customId.split("-");

        console.log(interaction.customId);

        if (!book || !chapter || !page) {
            return await interaction.reply({
                content: "Ett oväntat fel uppstod. Var vänlig försök igen.",
                ephemeral: true,
            });
        }

        let embed;
        do {
            embed = await getChapterPart(book, chapter, parseInt(page));
            console.log(embed.status);
            if (embed.status == undefined) continue;
            const chapterList = await getChapters(book);
            console.log(chapterList);
            if (chapterList.includes(chapter)) {
                // Get next chapter
                chapter = (parseInt(chapter) + 1).toString()
                embed = await getChapterPart(book, chapter, 1);
                console.log("Embed:", embed);

                break;
            }
            // get next book
            let bookIds = Object.keys(books);
            bookIds = bookIds.filter(
                (bookId) => bookIds.indexOf(bookId) == bookIds.indexOf(book) + 1
            );

            embed = await getChapterPart(bookIds[0], 1, 1);
        } while (embed.status != undefined);
        console.log("Embed:", embed);

        addData(embed);

        await interaction.message.edit({
            embeds: [embed],
            components: [getReadActionRow(book, chapter, page)],
        });
        await interaction.deferUpdate();
    },
};
