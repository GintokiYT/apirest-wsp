import express from 'express';
import cors from 'cors';

import { decryptMedia } from "@open-wa/wa-decrypt";
import crypto from "crypto";
import mime from "mime-types";
import fs from "fs";

const app = express();

app.use(cors('*'));

const message = {
  "mimeType": "image/webp",
  "name": null,
  "size": "0",
  "url": null,
  "deprecatedMms3Url": "https://mmg.whatsapp.net/v/t62.15575-24/30556738_671419064977166_6750365405676585315_n.enc?ccb=11-4&oh=01_AdSvwH6YdRptvU7gHAI-5U_kS6f9eYzK9QqDLaJfzLfBWw&oe=6590DF91&_nc_sid=5e03e0&mms3=true",
  "filehash": "BTEHBiYNQqrc+ds8ii/Ata3UKkNnuY+1XFP2SWz2HHU=",
  "mediaKey": "EmrAcnBcp0diH7xCCskD1C7D3Y5brsCNgMrEERW3Z9Q=",
  "type": "sticker"
};

const parseMessage = (message) => {
  return {
    clientUrl: undefined,
    deprecatedMms3Url: message.deprecatedMms3Url,
    filehash: message.filehash,
    mediaKey: message.mediaKey,
    mimetype: message.mimeType,
    size: Number(message.size),
    type: message.type
  }
}

async function test() {
  const newMessage = parseMessage(message)

  const mediaData = await decryptMedia(newMessage);

  let output_hash = crypto
    .createHash("sha256")
    .update(mediaData)
    .digest("base64");

  let hashValid = message.filehash == output_hash;
  console.log("Hash Validated:", hashValid);

  return {
    mimetype: newMessage.mimetype,
    data: mediaData,
  };

  // fs.writeFile(filename, mediaData, function (err) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   console.log("The file was saved!");
  // });

  //return mediaData;
}

app.get('/', async (req, res) => {
  try {
    const imageData = await test();

    res.setHeader('Content-disposition', 'attachment; filename=' + 'test.webp');
    res.setHeader('Content-type', imageData.mimetype);

    res.send(imageData.data)

  } catch (error) {
    console.error(error);
    res.status(500).send('Error obteniendo datos de media');
  }
});

app.listen(4000, () => {
  console.log('Server on port: ', 4000);
})