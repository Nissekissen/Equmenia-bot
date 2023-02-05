var fs = require('fs'),
    chunks = fs.readdirSync(__dirname + '/../../recordings/405366885157306369/'),
    inputStream,
    currentfile,
    outputStream = fs.createWriteStream(__dirname + '/../../recordings/merge.mp3');

chunks.sort((a, b) => { return a - b; });

const writeStream = fs.createWriteStream('out.mp3');

function appendFiles() {
    if (!chunks.length) {
        outputStream.end(() => console.log('Finished.'));
        return;
    }

    currentfile = `${__dirname}/../../recordings/405366885157306369/` + chunks.shift();
    inputStream = fs.createReadStream(currentfile);

    inputStream.pipe(outputStream, { end: false });

    inputStream.on('end', function() {
        console.log(currentfile + ' appended');
        appendFiles();
    });
}

appendFiles()