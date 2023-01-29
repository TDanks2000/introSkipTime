import fetch from "node-fetch";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import fs from "fs";
const fsPromise = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const downloadsFolder = path.join(__dirname, "..", "/downloads");

console.log(downloadsFolder);

export const download = async (segments) => {
  await Promise.allSettled(
    await segments.map(async (segment) => {
      const url = segment.uri;

      const response = await fetch(url);
      const buffer = await response.buffer();

      const fileName = url.split("/").pop();

      console.log(`Downloading ${fileName}...`);
      await saveFile(path.join(downloadsFolder, fileName), buffer);
      console.log(`Downloaded and saved${fileName}`);
    })
  );

  return true;
};

const saveFile = async (filePath, buffer) => {
  fsPromise.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
