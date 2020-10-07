const { execSync } = require("child_process");
const { argv } = require('yargs');

exports.ffprobe = (path) => {
	const { streams } = JSON.parse(execSync(`ffprobe -show_streams -show_entries streams:format=filename -of json '${path}'`, {
		stdio: 'pipe'
	}).toString());
	return {
		streams
	}
}

exports.ffmpeg = (path, params, output) => {
	const command = `ffmpeg -y -i '${path}' ${params} '${output}'`;
	if (argv.v) {
		console.log(`[EXECUTING] ${command}`);
	}
	return execSync(command, {
		stdio: 'pipe'
	}).toString();
}

exports.rename = (path, newPath) => {
	const command = `mv '${path}' '${newPath}'`;
	if (argv.v) {
		console.log(`[EXECUTING] ${command}`);
	}
	return execSync(command, {
		stdio: 'pipe'
	}).toString();
}