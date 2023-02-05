const AudioContext = require('web-audio-api').AudioContext;

function createSilentAudio(time) {
    const freq = 44100;
    const length = time * freq;

    const context = new AudioContext();

    const audioFile = context.
    console.log(context);
}

createSilentAudio()