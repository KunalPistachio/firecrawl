import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import * as path from "path";

export async function writeUploadedFileToTemp(
  uploadedFilename: string,
  uploadedBuffer: Buffer,
  fallbackExtension: string,
): Promise<string> {
  const ext = path.extname(uploadedFilename).toLowerCase() || fallbackExtension;
  const safeExt = ext.startsWith(".") ? ext : `.${ext}`;
  const tempFilePath = path.join(
    tmpdir(),
    `parse-upload-${randomUUID()}${safeExt}`,
  );
  await writeFile(tempFilePath, uploadedBuffer);
  return tempFilePath;
}
