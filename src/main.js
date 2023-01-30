import { program } from "commander";
import { cleanUp, download } from "./download.js";
import { convertToMp4 } from "./ffmpeg.js";
import { parse } from "./parse.js";
import { utils } from "./utils/index.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  const url = `https://t-ca-1.dokicloud.one/_v10/8d6ab62cc4e0fb6740db1f5777afad0b9994a1f28addafa69180059182a22bac38c4574e1261b75944f360a5fa7fc38469ff33bc27a31e4aff65f3065141d8b8238b183c0022387ad3142289a9cfa4838a3464035ab2a66266e23c6179b28b36b52e3ef3ff1126bf48e7e8e006a170b9471f097e9241aaf0dfb74901e1beff1b/360/index.m3u8`;

  const tvShow = "the-flash";
  const season = 1;
  const episode = 3;

  const { options, newM3U8 } = await parse(url);
  const downloaded = await download(options, tvShow, season, episode, newM3U8);

  const downloads = path.join(__dirname, "../", "downloads");
  const tvShowPath = path.join(downloads, tvShow);
  const seasonPath = path.join(
    tvShowPath,
    `S${utils.addZero(season)}E${utils.addZero(episode)}`
  );
  const filePath = path.join(seasonPath, "index.m3u8");
  const outputPath = path.join(seasonPath, "index.mp4");

  const convert = await convertToMp4(filePath, outputPath, seasonPath);

  if (convert) {
    console.log("Cleaning up...");
    cleanUp(seasonPath);
  } else {
    console.log("Something went wrong...");
    process.exit(1);
  }

  // console.log(downloaded);
};

main();
