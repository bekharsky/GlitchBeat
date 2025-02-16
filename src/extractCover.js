import { parseBuffer, parseBlob } from "music-metadata";
import { uint8ArrayToBase64 } from "uint8array-extras";

export async function extractCover(file) {
  try {
    const metadata = await parseBlob(file);
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const { format, data } = metadata.common.picture[0];
      return `data:${format};base64,${uint8ArrayToBase64(data)}`;
    }
  } catch (error) {
    console.error("Error reading metadata", error);
  }
}
