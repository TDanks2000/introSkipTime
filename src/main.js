import { program } from "commander";
import { download } from "./download.js";
import { parse } from "./parse.js";

const main = async () => {
  const url = `https://t-ca-1.dokicloud.one/_v10/8d6ab62cc4e0fb6740db1f5777afad0b9994a1f28addafa69180059182a22bac38c4574e1261b75944f360a5fa7fc38469ff33bc27a31e4aff65f3065141d8b8238b183c0022387ad3142289a9cfa4838a3464035ab2a66266e23c6179b28b36b52e3ef3ff1126bf48e7e8e006a170b9471f097e9241aaf0dfb74901e1beff1b/360/index.m3u8`;

  const parsed = await parse(url);
  const downloaded = await download(parsed);

  console.log(downloaded);
};

main();
