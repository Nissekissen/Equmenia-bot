import * as cheerio from "cheerio";
import cron from "node-cron";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, type Client } from "discord.js";
import { config } from "../config";

interface DailyVerse {
    content: string;
    verse: string;
    link: string;
}

function extractWritelnHtml(body: string): string | null {
    const match = body.match(/document\.writeln\(\s*'([\s\S]*?)'\s*\)\s*;/);
    if (!match) {
        return null;
    }

    return match[1].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\//g, "/");
}

function collapseWhitespace(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

export async function fetchDailyVerse(): Promise<DailyVerse | null> {
    const response = await fetch(config.dailyVerseUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; EqumeniaBot/1.0)",
            Referer: "https://www.bibeln.se/",
        },
    });

    if (!response.ok) {
        console.error(`Failed to fetch daily verse: ${response.status} ${response.statusText}`);
        return null;
    }

    const html = extractWritelnHtml(await response.text());
    if (!html) {
        console.error("Could not find document.writeln content in daily verse response");
        return null;
    }

    const $ = cheerio.load(html);
    $(".bibel_ord br").replaceWith(" ");
    const content = collapseWhitespace($(".bibel_ord").text());

    const verseLink = $("a.bibel_link").first();
    const verse = collapseWhitespace(verseLink.text());
    const link = verseLink.attr("href");

    if (!content || !verse || !link) {
        console.error("Daily verse response was missing expected fields");
        return null;
    }

    return { content, verse, link };
}

export async function postDailyVerse(client: Client): Promise<boolean> {
    const dailyVerse = await fetchDailyVerse();
    if (!dailyVerse) {
        return false;
    }

    const channel = await client.channels.fetch(config.dailyVerseChannelId);
    if (!channel?.isTextBased() || !("send" in channel)) {
        console.error(`Daily verse channel ${config.dailyVerseChannelId} is not a sendable text channel`);
        return false;
    }

    const today = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", year: "numeric" }).format(new Date())
    const content = `# Dagens bibelord ${today}\n\n${dailyVerse.content}\n\\- ${dailyVerse.verse}`
    const link = new ButtonBuilder()
        .setLabel("Läs vidare")
        .setStyle(ButtonStyle.Link)
        .setURL(dailyVerse.link)
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(link)

    await channel.send({ content: content, components: [row] });
    return true;
}

export function startDailyVerseJob(client: Client): void {
    cron.schedule(
        "0 6 * * *",
        () => {
            postDailyVerse(client).catch((error) => console.error("Error posting daily verse:", error));
        },
        { timezone: "Europe/Stockholm" },
    );
}
