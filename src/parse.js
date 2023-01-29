import m3u8Parser from "m3u8-parser";
import fetch from "node-fetch";

const parser = new m3u8Parser.Parser();

// check if the segments are absolute or relative
const isAbsolute = (url) => {
  return url.indexOf("://") > 0 || url.indexOf("//") === 0;
};

const removeLastSegmentOfUrl = (url) => {
  return url.split("/").slice(0, -1).join("/");
};

export const parse = async (url) => {
  const response = await fetch(url);
  const text = await response.text();

  await parser.push(text);
  await parser.end();

  const manifest = await parser.manifest;

  // loop through the segments and add the duration to the total duration if the duration is less than 300 seconds (5 minutes)
  let totalDuration = 0;
  const options = manifest.segments.filter((segment) => {
    if (totalDuration < 300) {
      totalDuration += segment.duration;
      return true;
    }
    return false;
  });

  // go through the segments and add the base url if the segment is relative
  options.forEach((option) => {
    if (!isAbsolute(option.uri)) {
      option.uri = removeLastSegmentOfUrl(url) + "/" + option.uri;
    }
  });

  return options;
};
