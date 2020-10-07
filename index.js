const { argv } = require("yargs");
const fs = require("fs");
const { ffprobe, ffmpeg, rename } = require("./utils/bash");

let transcodeCodec = "ac3";
const transcodeBitrate = "640k";

if (!argv.i) {
  throw new Error("No input file provided. Use -i to specify the input file");
}

if (argv.c) {
  transcodeCodec = argv.c;
}

if (argv.b) {
  transcodeCodec = argv.b;
}

// Get information about streams
const { streams } = ffprobe(argv.i);
const codecsWithLanguages = streams
  .filter((stream) => stream.codec_type === "audio")
  .map((stream) => ({
    codec_name: stream.codec_name,
    index: stream.index,
    language: stream.tags ? stream.tags.language || "und" : "und",
  }));

// Check the list of languages
const languages = Array.from(
  new Set(codecsWithLanguages.map((c) => c.language))
);

const mappings = {};
languages.forEach((lang) => {
  mappings[lang] = codecsWithLanguages
    .filter((c) => c.language === lang)
    .map((c) => ({
      codec: c.codec_name,
      index: c.index,
      transcode: false,
    }));
});

for (const lang of languages) {
  const codecsPerLang = mappings[lang].map((m) => m.codec);
  if (!codecsPerLang.includes("ac3") && !codecsPerLang.includes("eac3")) {
    mappings[lang][0].transcode = true;
  }
}

const inputMappings = ["-map 0:v:0"];

const outputMappings = ["-c:0 copy"];

let needsProcessing = false;
languages.forEach((lang) => {
  mappings[lang].forEach((stream) => {
    inputMappings.push(`-map 0:${stream.index}`);
    outputMappings.push(`-c:${inputMappings.length - 1} copy`);
    if (stream.transcode) {
      needsProcessing = true;
      inputMappings.push(`-map 0:${stream.index}`);
      outputMappings.push(
        `-c:${inputMappings.length - 1} ${transcodeCodec} -b:${
          inputMappings.length - 1
        } ${transcodeBitrate}`
      );
    }
  });
});

const params = inputMappings.concat(outputMappings).join(" ");

if (argv.v) {
  console.log(`[INPUT FILE] ${argv.i}`);
  console.log(`[CODEC] ${transcodeCodec}`);
  console.log(`[BITRATE] ${transcodeBitrate}`);
  console.log(`[MAPPINGS] ${JSON.stringify(mappings)}`);
  console.log(`[PARAMS] ${params}`);
}

if (needsProcessing) {
  const result = ffmpeg(argv.i, params, argv.i.replace(".mkv", "-DTS.AC3.mkv"));
  rename(argv.i, `${argv.i}.orig`);
  fs.appendFileSync("./dts2dolby.log", result);
} else {
  console.log("[RESULT] Nothing to process");
}
