# dts2dolby
![build](https://github.com/pravinba9495/dts2dolby/workflows/build/badge.svg?branch=main) ![GitHub package.json version](https://img.shields.io/github/package-json/v/pravinba9495/dts2dolby) ![GitHub](https://img.shields.io/github/license/pravinba9495/dts2dolby)

Automatically add AC3/EAC3 tracks to source MKV files when the source files do not contain any Dolby Digital(AC3) or Dolby Digital Plus(EAC3) tracks, useful for allowing Plex to Direct Play media on certain devices like the Xbox One, Chromecast, etc.

## Motivation

As an avid Plex user and an audiophile, I like to have all my media at the best quality possible. This includes having the video resolution at 4K/1080p and having the audio in lossless codecs such as Dolby TrueHD and DTS-HD MA. I own an Xbox One S, Chromecast Ultra, Samsung 4K HDR TV (2016) and an Onkyo NR-565 7.2 AV Receiver. All the devices are connected to my ethernet switch using Cat6 RJ45 cables to ensure high speed data transfers between my NAS and the streaming devices.

Inspite of having top notch speeds, I occasionally find Plex trying to transcode my media files to be able to play on my streaming devices, instead of Direct Play or Direct Stream. Upon investigation I found out that my Xbox One S does not allow third party apps like Plex to be able to bitstream lossless audio codec. It however can bitstream any audio codec via the Blu-Ray app. Upon enabling the 'Playback Information' setting on Plex, I found out that the Plex App on the Xbox One S can bitstream Dolby Digital(AC3) and Dolby Digital Plus(EAC3) but none of the DTS(DCA) codecs.

Since Dolby Digital is royatly free (due to expired patents), I decided to remux an AC3/EAC3 track back to the media files that do not have any AC3/EAC3 tracks in them, while still retaining lossless tracks in the source MKV. 

## Requirements

1. `ffmpeg`: A complete, cross-platform solution to record, convert and stream audio and video.

The documentations assumes that you have `ffmpeg` available in your path. `dts2dolby` uses `ffmpeg` as the backend.

## Usage

```bash
dts2dolby -v -c ac3 -b 640k -i INPUT.mkv
```
The above command will analyze the input file and decide whether an AC3/EAC3 track should be added to it to allow Plex to Direct Play the media file. The output file will be generated at the same location as the input with `-DTS.AC3` at the end of the filename. The original file will be renamed with the suffix `.orig` 

### Example
```bash
dts2dolby -i INPUT.mkv
# Output: INPUT-DTS.AC3.mkv
```

## Command Line Parameters
```bash
-v  Enables verbose output (Optional)
-i  Path to input file (Required)
-c  Audio Codec to be added (Allowed values: 'ac3' or 'eac3'), (Optional, Default: 'ac3')
-b  Bitrate of the added track (Use 640k for 'ac3', or 3000k for 'eac3'), (Optional, Default: '640k')
```

## License
MIT License
