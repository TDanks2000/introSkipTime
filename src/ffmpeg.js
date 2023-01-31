import childProcess from "child_process";
import fs from "fs";
const fsPromise = fs.promises;

// export const fetchFile = async (filePath) => {
//   const response = await fetch(filePath);
//   const data = await response.arrayBuffer();

//   return new Uint8Array(data);
// };

export const convertToMp4 = async (filePath, outputPath, folder) => {
  console.log("Converting to mp4...");

  const promise = new Promise((resolve, reject) => {
    childProcess.exec(
      `ffmpeg -allowed_extensions ALL -i ${filePath} -acodec copy -vcodec copy ${outputPath} -y`,
      (err, stdout, stderr) => {
        if (err) return console.log(err);
        // get the frame rate of the video
        const frameRate = stderr
          .split("Stream #0:0")[1]
          .split("Video:")[1]
          .split(",")[3]
          .split(" ")[1];

        resolve({
          frameRate,
        });
      }
    );
  });

  return promise;
};

export const extractFrames = async (
  filePath,
  outputPath,
  frameRate,
  frames = 5
) => {
  // check if directory exists and create it if it doesn't
  if (!fs.existsSync(outputPath))
    await fsPromise.mkdir(outputPath, { recursive: true });

  console.log("Extracting frames...");

  const promise = new Promise((resolve, reject) => {
    childProcess.exec(
      `ffmpeg -i ${filePath} -vf fps=${frameRate}/${frames} ${outputPath}\\img_%03d.jpg -y`,
      (err, stdout, stderr) => {
        if (err) return console.log(err);
        resolve(true);
      }
    );
  });

  return promise;
};
