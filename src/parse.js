import m3u8Parser from "m3u8-parser";
import fetch from "node-fetch";

const parser = new m3u8Parser.Parser();

// check if the segments are absolute or relative
const isAbsolute = (url) => {
  return (
    url.startsWith("http") || url.startsWith("https") || url.startsWith("//")
  );
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
  const options = await manifest.segments.filter((segment) => {
    if (totalDuration < 300) {
      totalDuration += segment.duration;
      return true;
    }
    return false;
  });

  // remove the unneeded segments from the manifest
  manifest.segments = options;

  // remove all the segments and the duration from the manifest
  let newM3U8 = text.split("#EXT-X-ENDLIST")[0];
  newM3U8 = newM3U8.split("#EXTINF")[0];

  // add the #EXTINF duration to the new manifest and the segments after ea
  newM3U8 += await options
    .map((option) => {
      // check if the segment is absolute or relative and remove the base url if it is absolute
      if (isAbsolute(option.uri)) {
        option.uri = option.uri.split("/").slice(-1)[0];
      }
      return `#EXTINF:${option.duration},\n${option.uri}`;
    })
    .join("\n");

  // add the #EXT-X-ENDLIST to the end of the new manifest
  newM3U8 += await "\n#EXT-X-ENDLIST";

  // go through the segments and add the base url if the segment is relative
  await options.forEach((option) => {
    if (!isAbsolute(option.uri)) {
      option.uri = removeLastSegmentOfUrl(url) + "/" + option.uri;
    }
  });

  return {
    options,
    newM3U8,
  };
};
