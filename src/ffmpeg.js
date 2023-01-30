import childProcess from "child_process";

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
        resolve(true);
      }
    );
  });

  return promise;
};
