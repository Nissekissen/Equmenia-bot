module.exports = {
    log: text => {
        const date = new Date();
        const prefix = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - `
        console.log(prefix + text);
    }
}
