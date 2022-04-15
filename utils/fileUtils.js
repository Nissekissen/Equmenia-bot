const fs = require("node:fs")

const errFunc = (err) => {
    if (err)  throw err;
}

module.exports = {
    writeToFile(path, content) {
        fs.writeFileSync(path, content, (err) => {
            if (err)  throw err;
        });

    },
    clearFile(path) {
        fs.unlinkSync(path, (err) => {
            if (err)  throw err;
        })
        fs.writeFileSync(path, "", (err) => {
            if (err)  throw err;
        })
    },
    readFile(path) {
        return fs.readFileSync(path, 'utf8', (err) => {
            if (err) throw err;
        })
    },
    deleteFile(path) {
        fs.unlinkSync(path, (err) => {
            if (err)  throw err;
        })
    }
}