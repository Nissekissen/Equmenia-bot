module.exports = {
    listToRows(array) {
        let com = []
        const result = new Array(Math.ceil(array.length / 5)).fill().map(_ => array.splice(0, 5))
        for (const row of result) {
            com.push(new MessageActionRow())
            for (const button of result[result.indexOf(row)]) {
                com[result.indexOf(row)].addComponents(
                    new MessageButton()
                        .setStyle('PRIMARY')
                        .setEmoji(button.emoji)
                        .setCustomId(button.customId)
                        .setLabel(button.label)
                )
            }
        }
        return com
    },
    rowsToList(array) {
        let newComponents = []
        for (const row of array) {
            for (const button of row.components) {
                newComponents.push(button)
            }
        }
        return newComponents
    }
}