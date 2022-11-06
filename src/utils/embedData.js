const { EmbedBuilder } = require("discord.js");

module.exports = EmbedBuilder.prototype.addData = (embed, skipThumbnail) => {
    embed.setColor('#8C3C8D');
    if (!skipThumbnail) embed.setThumbnail('https://yt3.ggpht.com/ytc/AMLnZu_zw98TDXLnLwNj7iT1X6HjvkZBclgADAQnA130=s900-c-k-c0x00ffffff-no-rj');
}