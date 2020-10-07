const { argv } = require('yargs');
const { ffprobe, ffmpeg, rename } = require('./utils/bash');

const transcodeCodec = 'ac3';
const transcodeBitrate = '640k';

if (!argv.i) {
	throw new Error('No input file provided. Use -i to specify the input file');
}

if (argv.c) {
	transcodeCodec = argv.c;
}

if (argv.b) {
	transcodeCodec = argv.b;
}

// Get information about streams
const { streams } = ffprobe(argv.i);
const codecs_with_languages = streams.filter(stream => stream.codec_type === 'audio').map(stream => {
	return {
		codec_name: stream.codec_name,
		index: stream.index,
		language: stream.tags ? (stream.tags.language || 'und') : 'und'
	};
});

// Check the list of languages
const languages = Array.from(new Set(codecs_with_languages.map(c => c.language)));

let mappings = {};
languages.forEach((lang) => {
	mappings[lang] = codecs_with_languages.filter(c => c.language === lang).map(c => {
		return {
			codec: c.codec_name,
			index: c.index,
			transcode: false
		};
	});
});

for (let lang of languages) {
	const codecs_per_lang = mappings[lang].map(m => m.codec);
	if (!codecs_per_lang.includes('ac3') && !codecs_per_lang.includes('eac3')) {
		mappings[lang][0].transcode = true;
	}
}

if (argv.v) {

}

let inputMappings = [
	'-map 0:v:0',
];

let outputMappings = [
	'-c:0 copy',
];

let needsProcessing = false;
languages.forEach((lang) => {
	mappings[lang].forEach((stream) => {
		inputMappings.push(`-map 0:${stream.index}`);
		outputMappings.push(`-c:${inputMappings.length - 1} copy`);
		if (stream.transcode) {
			needsProcessing = true;
			inputMappings.push(`-map 0:${stream.index}`);
			outputMappings.push(`-c:${inputMappings.length - 1} ${transcodeCodec} -b:${inputMappings.length - 1} ${transcodeBitrate}`);
		}
	});
});


const params = inputMappings.concat(outputMappings).join(' ');

if (argv.v) {
	console.log(`[INPUT FILE] ${argv.i}`);
	console.log(`[CODEC] ${transcodeCodec}`);
	console.log(`[BITRATE] ${transcodeBitrate}`);
	console.log(`[MAPPINGS] ${JSON.stringify(mappings)}`);
	console.log(`[PARAMS] ${params}`);
}

if (needsProcessing) {
	const result = ffmpeg(argv.i, params, argv.i.replace('.mkv', '-DTS.AC3.mkv'));
	rename(argv.i, argv.i + '.orig');
	fs.appendFileSync('./dts2dolby.log', result);
} else {
	console.log(`[RESULT] Nothing to process`);
}



