import fetch from "node-fetch";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import fs from "fs";
import { utils } from "./utils/index.js";
const fsPromise = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const downloadsFolder = path.join(__dirname, "..", "/downloads");

export const download = async (segments, tvShow, season, episode, newM3U8) => {
  await Promise.allSettled(
    segments.map(async (segment) => {
      const url = segment.uri;

      const response = await fetch(url);
      const buffer = await response.buffer();

      const fileName = url.split("/").pop();

      console.log(`Downloading ${fileName}...`);
      await saveFile(
        path.join(
          downloadsFolder,
          tvShow,
          `S${utils.addZero(season)}E${utils.addZero(episode)}`,
          fileName
        ),
        buffer
      );
      console.log(`Downloaded and saved ${fileName}`);
      return true;
    })
  );

  // save the new m3u8 file
  await saveNewM3U8(
    path.join(
      downloadsFolder,
      tvShow,
      `S${utils.addZero(season)}E${utils.addZero(episode)}`,
      "index.m3u8"
    ),
    newM3U8
  );

  return true;
};

const saveFile = async (filePath, buffer) => {
  //create folder if it doesn't exist
  if (!fs.existsSync(filePath))
    await fsPromise.mkdir(path.dirname(filePath), { recursive: true });

  fsPromise.writeFile(filePath, buffer, (err) => {
    if (err) console.log(err);
  });
};

const saveNewM3U8 = async (filePath, newM3U8) => {
  //create folder if it doesn't exist
  if (!fs.existsSync(filePath))
    await fsPromise.mkdir(path.dirname(filePath), { recursive: true });

  //save the new m3u8 file
  fsPromise.writeFile(filePath, newM3U8, (err) => {
    if (err) console.log(err);
  });
};

export const cleanUp = async (folder) => {
  console.log("Cleaning up...");

  fs.readdir(folder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file) => {
      if (!file.endsWith(".mp4")) {
        const filePath = path.join(folder, file);
        fs.unlink(filePath, (err) => {
          if (err) return console.error(err);

          console.log(`Deleted ${filePath}`);
        });
      }
    });
  });

  console.log("Cleaned up");
};
