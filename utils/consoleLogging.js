module.exports = {
    logToFile(text) {
        let currentdate = new Date();
        let datetime = currentdate.getFullYear() + "-"
            + (currentdate.getMonth()+1) + "-"
            + currentdate.getDate() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds() + " ";
        console.log(datetime + text)
    }
}