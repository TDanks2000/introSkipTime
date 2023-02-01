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

import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  const url = `https://t-ca-1.dokicloud.one/_v10/3f1cfe93d3bc791285ce3d66939391f3393e40ad2b7dee485885897fd87f2a0020e1ac5e8f208f27851824715f95950a9db2e85f2a218b5187958eea9687bef52731ea56c1bf600738270ee6b1dd2e27025c14677089f4ea6384535b3527b24a13a927eee22c189af49fc261ab9fb8b6e48cfb955717f62c85373733f78ee129/360/index.m3u8`;

  const url2 = `https://t-eu-3.onthecloudcdn.com/_v10/ffb0dc4a3e18391c2158fade194785b3e1ee61be42fe220fa54afd4df9217e519d1ca000141736c4d23dcaa9d337a96a428a4d1f21af28753fb11a1a797e29ff872471348a4cfca43874476fb736b975d5e2afc5fbad9c8e611656242ed6c8d0f66fbb74f74b6748c874d1ead10729b0d919d82fff2db9727476cf0588dcfcbe/360/index.m3u8`;

  const tvShow = "big-mouth";
  const season = 1;
  const episode = 1;

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

  const firstEpisodeParse = await parse(url);
  const downloadFirstEpisode = await download(
    firstEpisodeParse?.options,
    tvShow,
    season,
    episode,
    firstEpisodeParse?.newM3U8
  );
  const convertFirstEpisode = await convertToMp4(
    firstEpisodeFilePath,
    firstEpisodeOutputPath
  );
  const firstEpisodeFramerate = convertFirstEpisode.frameRate;
  const firstEpisodeFrames = await extractFrames(
    firstEpisodeOutputPath,
    seasonFramesPath,
    firstEpisodeFramerate
  );
  const firstEpisodeHashes = await hashImages(seasonFramesPath);

  const secondEpisodeParse = await parse(url2);
  const downloadSecondEpisode = await download(
    secondEpisodeParse?.options,
    tvShow,
    season,
    episode + 1,
    secondEpisodeParse?.newM3U8
  );
  const convertSecondEpisode = await convertToMp4(
    secondEpisodeFilePath,
    secondEpisodeOutputPath
  );

  const secondEpisodeFramerate = convertSecondEpisode.frameRate;

  const secondEpisodeFrames = await extractFrames(
    secondEpisodeOutputPath,
    secondSeasonFramesPath,
    secondEpisodeFramerate
  );

  const secondEpisodeHashes = await hashImages(secondSeasonFramesPath);

  const compareEpisodes = await compareTwoHashArrays(
    firstEpisodeHashes,
    secondEpisodeHashes
  );

  console.log(compareEpisodes);
};

main();
