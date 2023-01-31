import { imageHash } from "image-hash";
import fs from "fs";
import path from "path";

export const getImageHash = async (image) => {
  let hash = "";

  await imageHash(image, 16, false, (error, data) => {
    if (error) console.log(error);
    hash = data;
  });

  return hash;
};

export const hashImages = async (inputPath) => {
  const images = [];
  const files = fs.readdirSync(inputPath);

  for (const file of files) {
    // read file from input path
    const image = fs.readFileSync(path.join(inputPath, file));
    const hash = await getImageHash({
      ext: "image/jpeg",
      data: image,
    });
    console.log(hash);
    images.push({
      hash,
      name: file,
    });
  }

  return images;
};

export const compareHashes = async (hashes) => {};
