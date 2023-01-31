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

export const compareHashes = async (arrays) => {
  // first remove the black image hashes and then loop through all hashes and compare them to each other to find similar images return the biggest array of similar images

  const similarImages = arrays.reduce((acc, current) => {
    const similar = [];
    for (const compare of arrays) {
      if (current.hash === compare.hash && current.name !== compare.name) {
        similar.push(compare.name);
      }
    }
    if (similar.length > acc.length) {
      acc = similar;
    }
    return acc;
  }, []);

  // let similarImages = [];
  // for (let i = 0; i < arrays.length; i++) {
  //   const currentHash = arrays[i].hash;
  //   const currentName = arrays[i].name;
  //   const similar = [];
  //   for (let j = 0; j < arrays.length; j++) {
  //     const compareHash = arrays[j].hash;
  //     const compareName = arrays[j].name;
  //     if (currentHash === compareHash && currentName !== compareName) {
  //       similar.push(compareName);
  //     }
  //   }
  //   if (similar.length > similarImages.length) {
  //     similarImages = similar;
  //   }
  // }

  return similarImages;
};

// get the timestamp for the video from the image number and the framerate (every image is taken every 5th frame)

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
