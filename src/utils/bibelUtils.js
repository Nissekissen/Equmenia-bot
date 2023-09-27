const axios = require("axios");
const bookJSON = require("../../books.json");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const bibleReadBuilder = require("../buttons/bible-read-builder");

function splitArray(array, chunkSize) {
    const result = array.reduce((all, one, i) => {
        const ch = Math.floor(i / chunkSize);
        all[ch] = [].concat(all[ch] || [], one);
        return all;
    }, []);

    return result;
}

async function getData(url, data) {
    const formData = new URLSearchParams();

    formData.append("psApiRequest", JSON.stringify(data));

    const response = await axios({
        method: "POST",
        url: url,
        data: formData,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    return response;
}

function getBibleTextFromHTML(html) {
    const data = html.split(`<div class="bt-bcv`);

    const verses = [];

    for (const verse of data) {
        if (data.indexOf(verse) == 0) continue;
        let verseData = "";
        for (const [i, versePart] of Object.entries(verse.split("<p>"))) {
            if (i == 0) continue;
            verseData += versePart.split("</p>")[0];
        }
        verses.push(verseData);
    }

    return verses;
}

function getKeyByValue(obj, value) {
    return Object.keys(obj).filter((key) => obj[key] === value)[0];
}

async function getChapter(book, chapter) {
    const data = {
        _userkey: "abc123",
        _preferred_content_type: "html",
        command_sub: "auto",
        _database: "bt2",
        book: book,
        readchapter: parseInt(chapter),
    };

    const url = "https://bibeln.se/bn/api/1.0/read/auto";

    const response = await getData(url, data);

    const verses = getBibleTextFromHTML(response.data);

    return verses;
}

async function getBooks() {
    const data = {
        _userkey: "abc123",
        _preferred_content_type: "json",
        command: "meta",
        command_sub: "sitebible",
        _database: "bt2",
    };
    const url = "https://bibeln.se/bn/api/1.0/meta/sitebible";

    const response = await getData(url, data);

    const bibleData = response.data.bibletool.meta.bible.b2k;

    const sectionList = bibleData.sectionlist;

    const sections = {};

    for (const section of sectionList) {
        sections.old = [];
        sections.new = [];
    }

    for (const [key, value] of Object.entries(sections)) {
        for (const book of bibleData.sectionmap[key]) {
            value.push(book);
        }
    }

    return sections;
}

async function getChapters(book) {
    const data = {
        _userkey: "abc123",
        _preferred_content_type: "json",
        command: "meta",
        command_sub: `chapter/b2k/${book}`,
        _database: "bt2",
    };

    const url = `https://bibeln.se/bn/api/1.0/meta/chapter/b2k/${book}`;

    const response = await getData(url, data);

    const bibleData = response.data.bibletool.meta.bible.b2k;

    const chapterList = bibleData.bookchaptermap[book];

    return chapterList;
}
function bookToId(book) {
    return getKeyByValue(bookJSON, book);
}
function bookIdToBook(id) {
    return bookJSON[id];
}

async function getChapterPart(book, chapter, page) {
    const books = await getBooks();

    let skip = false;
    for (const [key, value] of Object.entries(books)) {
        for (const b of value) {
            if (b == book) skip = true;
            if (skip) break;
        }
        if (skip) break;
    }
    if (!skip) {
        return { status: 404 };
    }

    const chapters = await getChapters(book);
    if (!chapters.includes(chapter) || isNaN(parseInt(chapter))) {
        console.log(chapters);
        console.log(chapter);
        chapter = "1";
    }

    const chapterData = await getChapter(book, chapter);

    const chunkArray = splitArray(chapterData, 10);

    if (typeof chunkArray[page - 1] === "undefined") {
        return { status: 400, message: "Bad page" }
    }

    const embed = new EmbedBuilder().setTitle(
        `${bookIdToBook(book)} - ${chapter}:${(page - 1) * 10 + 1}`
    );

    // Page 1: verse 1-20
    // Page 2: verse 21-40
    // ...

    for (const [i, value] of Object.entries(chunkArray[page - 1])) {
        embed.addFields({
            name: "\u200b",
            value: `(${(page - 1) * 10 + parseInt(i) + 1}) ${value}`,
        });
    }

    return embed;
}

function getReadActionRow(book, chapter, page) {
    const backBuilder = ButtonBuilder.from(bibleReadBuilder.backBuilder.toJSON());
    const builder = ButtonBuilder.from(bibleReadBuilder.builder.toJSON());
    const row = new ActionRowBuilder().addComponents(
        backBuilder
            .setCustomId(`bible_read-${book}-${chapter}-${parseInt(page) - 1}`)
            .setDisabled(false),
        builder.setCustomId(
            `bible_read-${book}-${chapter}-${parseInt(page) + 1}`
        )
    );

    if (parseInt(page) == 1) {
        // Get previous chapter and/or book

        row.components[0]
            .setLabel("Föregående kapitel")
            .setCustomId(`bible_read-${book}-${parseInt(chapter) - 1}-1`)
            .setDisabled(false);

        if (parseInt(chapter) == 1) {
            // Get previous book
            let bookIds = Object.keys(bookJSON);
            bookIds = bookIds.filter(
                (bookId) => bookIds.indexOf(bookId) == bookIds.indexOf(book) - 1
            );

            if (bookIds.length == 0) {
                // There is no previous book
                row.components[0].setDisabled(true);
            }

            row.components[0]
                .setLabel("Föregående bok")
                .setCustomId(`bible_read-${bookIds[0]}-1-1`);
        }
    }

    console.log(row.components[0]);

    return row;
}

module.exports = {
    getReadActionRow,
    bookToId,
    bookIdToBook,
    getChapter,
    getChapters,
    getChapterPart,
};
