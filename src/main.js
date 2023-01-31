import { program } from "commander";
import { cleanUp, download } from "./download.js";
import { convertToMp4, extractFrames } from "./ffmpeg.js";
import { parse } from "./parse.js";
import { utils } from "./utils/index.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import {
  compareHashes,
  compareTwoHashArrays,
  getTimestamp,
  getTimeStampFromArray,
  hashImages,
} from "./image.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  const url = `https://t-ca-1.dokicloud.one/_v10/74a8d7f00d9e6634c52806f15fc8f272ef7ad84b8ce6472bccf5729c8d377756e3a8e96c452a4e81a378c18dcda18558c11ee2ddc38bb65c0cdc209cde38df5c6f986222da6790f0fa9a8defdb9e73f7370312e0e86a7f4907adf49ebe8ed0fbd500a29385c7a93c39846be809099a9362abdf961866b3a366298d362ad2f904/360/index.m3u8`;
  const url2 = `https://t-eu-3.onthecloudcdn.com/_v10/ffb0dc4a3e18391c2158fade194785b3e1ee61be42fe220fa54afd4df9217e519d1ca000141736c4d23dcaa9d337a96a428a4d1f21af28753fb11a1a797e29ff872471348a4cfca43874476fb736b975d5e2afc5fbad9c8e611656242ed6c8d0f66fbb74f74b6748c874d1ead10729b0d919d82fff2db9727476cf0588dcfcbe/360/index.m3u8`;

  const tvShow = "the-flash";
  const season = 1;
  const episode = 2;

  const downloads = path.join(__dirname, "../", "downloads");
  const tvShowPath = path.join(downloads, tvShow);

  const seasonPath = path.join(
    tvShowPath,
    `S${utils.addZero(season)}E${utils.addZero(episode)}`
  );
  const secondSeasonPath = path.join(
    tvShowPath,
    `S${utils.addZero(season)}E${utils.addZero(episode + 1)}`
  );

  const framesPath = path.join(__dirname, "../", "frames");
  const tvShowFramesPath = path.join(framesPath, tvShow);

  const seasonFramesPath = path.join(
    tvShowFramesPath,
    `S${utils.addZero(season)}E${utils.addZero(episode)}`
  );

  const secondSeasonFramesPath = path.join(
    tvShowFramesPath,
    `S${utils.addZero(season)}E${utils.addZero(episode + 1)}`
  );

  const firstEpisodeFilePath = path.join(seasonPath, "index.m3u8");
  const secondEpisodeFilePath = path.join(secondSeasonPath, "index.m3u8");
  const firstEpisodeOutputPath = path.join(seasonPath, "index.mp4");
  const secondEpisodeOutputPath = path.join(secondSeasonPath, "index.mp4");

  const { options: firstEpisodeOptions, newM3U8: newM3U8FirstEpisode } =
    await parse(url);
  const { options: secondEpisodeOptions, newM3U8: newM3U8SecondEpisode } =
    await parse(url2);

  const downloadFirstEpisode = await download(
    firstEpisodeOptions,
    tvShow,
    season,
    episode,
    newM3U8FirstEpisode
  );
  const downloadSecondEpisode = await download(
    secondEpisodeOptions,
    tvShow,
    season,
    episode + 1,
    newM3U8SecondEpisode
  );

  const convertFirstEpisode = await convertToMp4(
    firstEpisodeFilePath,
    firstEpisodeOutputPath
  );
  const convertSecondEpisode = await convertToMp4(
    secondEpisodeFilePath,
    secondEpisodeOutputPath
  );

  const firstEpisodeFramerate = convertFirstEpisode.frameRate;
  const secondEpisodeFramerate = convertSecondEpisode.frameRate;

  const firstEpisodeFrames = await extractFrames(
    seasonPath,
    seasonFramesPath,
    firstEpisodeFramerate
  );

  const secondEpisodeFrames = await extractFrames(
    secondSeasonPath,
    secondSeasonFramesPath,
    secondEpisodeFramerate
  );

  const firstEpisodeHashes = await hashImages(seasonFramesPath);
  const secondEpisodeHashes = await hashImages(secondSeasonFramesPath);

  const compareEpisodes = await compareTwoHashArrays(
    firstEpisodeHashes,
    secondEpisodeHashes
  );

  console.log(compareEpisodes);
};

main();
