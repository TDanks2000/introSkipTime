// import { imageHash } from "image-hash";
import imghash from "imghash";
import leven from "leven";

import fs from "fs";
import path from "path";

export const getImageHash = async (image) => {
  let hash = await imghash.hash(image?.data, 16, "hex");

  console.log(hash);

  return hash;
};

export const hashImages = async (inputPath) => {
  const images = [];
  const files = fs.readdirSync(inputPath);

  await Promise.allSettled(
    files.map(async (file) => {
      // read file from input path
      const image = fs.readFileSync(path.join(inputPath, file));
      const hash = await getImageHash({
        ext: "image/jpeg",
        data: image,
      });
      console.log("generated hash: ", hash);
      images.push({
        hash,
        name: file,
      });
    })
  );

  return images;
};

export const compareHashes = async (array) => {
  // loop through the array of hashes and compare them to each other and push the most similar images to an array and return the array with the most similar images

  const similarImages = [];

  for (const current of array) {
    const similar = [];
    for (const compare of array) {
      if (current.hash === compare.hash && current.name !== compare.name) {
        similar.push(compare.name);
      }
    }
    if (similar.length > similarImages.length) {
      similarImages.length = 0;
      similarImages.push(...similar);
    }
  }

  return similarImages;

  // const similarImages = arrays.reduce((acc, current) => {
  //   const similar = [];
  //   for (const compare of arrays) {
  //     if (current.hash === compare.hash && current.name !== compare.name) {
  //       similar.push(compare.name);
  //     }
  //   }
  //   if (similar.length > acc.length) {
  //     acc = similar;
  //   }
  //   return acc;
  // }, []);

  // return similarImages;
};

export const compareTwoHashArrays = (array1, array2, tolerance = 12) => {
  // convert each array to just the hashes

  // loop through the first array and compare each hash to the second array and if the hash is similar push the image to an array and return the array with the most similar images using leven

  const similarImages = [];

  for (const current of array1) {
    const similar = [];
    for (const compare of array2) {
      if (leven(current.hash, compare.hash) <= tolerance) {
        similar.push(compare.name);
      }
    }
    if (similar.length > similarImages.length) {
      similarImages.length = 0;
      similarImages.push(...similar);
    }
  }

  return similarImages;
};

export const getTimestamp = (image, framerate) => {
  const imageNumber = image.split(".")[0]?.replace(/[^0-9.]/g, "");

  // convert the image number to seconds based on the framerate and that the image is taken every 5th frame
  const seconds = Math.round((imageNumber * 5) / framerate);

  return seconds;
};

export const getTimeStampFromArray = (array, framerate) => {
  // get first image from array and get the timestamp from it and then get the last image from the array and get the timestamp
  const firstImage = array[0];
  const lastImage = array[array.length - 1];

  const firstTimestamp = getTimestamp(firstImage, framerate);
  const lastTimestamp = getTimestamp(lastImage, framerate);

  return {
    start: firstTimestamp,
    end: lastTimestamp,
  };
};
