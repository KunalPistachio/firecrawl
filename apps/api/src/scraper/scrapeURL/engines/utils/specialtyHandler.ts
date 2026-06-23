import { Logger } from "winston";
import { UnsupportedFileError } from "../../error";
import { FireEngineCheckStatusSuccess } from "../fire-engine/checkStatus";
type SpecialtyFileType = "pdf" | "document";

const documentTypes = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/msword",
  "application/rtf",
  "text/rtf",
  "application/vnd.oasis.opendocument.text",
];

export function detectSpecialtyFileType(
  contentType: string | undefined,
  feRes?: FireEngineCheckStatusSuccess,
): SpecialtyFileType | null {
  if (!contentType) {
    return null;
  }

  const normalizedContentType = contentType.toLowerCase();
  const isDocument = documentTypes.some(type =>
    normalizedContentType.startsWith(type),
  );
  const isPdf =
    normalizedContentType === "application/pdf" ||
    normalizedContentType.startsWith("application/pdf;");
  const isOctetStream = normalizedContentType === "application/octet-stream";

  if (isDocument) {
    return "document";
  }

  if (isPdf) {
    return "pdf";
  }

  if (isOctetStream) {
    const isZipSignature =
      feRes?.file?.content.startsWith("UEsD") ||
      feRes?.content.startsWith("PK");
    const isOleSignature =
      feRes?.file?.content.startsWith("0M8R4K") ||
      feRes?.content.startsWith("\xD0\xCF\x11\xE0");
    const isPdfSignature =
      feRes?.file?.content.startsWith("JVBERi0") ||
      feRes?.content.startsWith("%PDF-");

    if (isZipSignature || isOleSignature) {
      return "document";
    }
    if (isPdfSignature) {
      return "pdf";
    }
  }

  return null;
}

export async function specialtyScrapeCheck(
  logger: Logger,
  headers: Record<string, string> | undefined,
  feRes?: FireEngineCheckStatusSuccess,
) {
  const contentType = (Object.entries(headers ?? {}).find(
    x => x[0].toLowerCase() === "content-type",
  ) ?? [])[1];

  if (!contentType) {
    logger.warn("Failed to check contentType -- was not present in headers", {
      headers,
    });
    return;
  }

  if (detectSpecialtyFileType(contentType, feRes)) {
    return;
  }

  // Reject unsupported binary content types (images, video, audio, archives, etc.)
  const unsupportedBinaryPrefixes = [
    "image/",
    "video/",
    "audio/",
    "application/zip",
    "application/x-tar",
    "application/gzip",
    "application/x-rar",
    "application/x-7z",
    "application/wasm",
    "application/x-executable",
    "application/x-sharedlib",
    "application/java-archive",
  ];
  if (
    unsupportedBinaryPrefixes.some(prefix => contentType.startsWith(prefix))
  ) {
    throw new UnsupportedFileError(contentType);
  }
}
