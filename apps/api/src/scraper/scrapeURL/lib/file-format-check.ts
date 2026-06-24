import * as path from "path";

const DOCUMENT_EXTENSIONS = new Set([
  ".docx",
  ".doc",
  ".odt",
  ".rtf",
  ".xlsx",
  ".xls",
]);

const HTML_EXTENSIONS = new Set([".html", ".htm", ".xhtml"]);

export function isPdfUpload(filename: string, contentType?: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const normalizedType = contentType?.toLowerCase() ?? "";
  return (
    ext === ".pdf" ||
    normalizedType === "application/pdf" ||
    normalizedType.startsWith("application/pdf;")
  );
}

export function isDocumentUpload(
  filename: string,
  contentType?: string,
): boolean {
  const ext = path.extname(filename).toLowerCase();
  const normalizedType = contentType?.toLowerCase() ?? "";
  return (
    DOCUMENT_EXTENSIONS.has(ext) ||
    normalizedType.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ) ||
    normalizedType.includes("application/vnd.ms-excel") ||
    normalizedType.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ) ||
    normalizedType.includes("application/msword") ||
    normalizedType.includes("application/vnd.oasis.opendocument.text") ||
    normalizedType.includes("application/rtf") ||
    normalizedType.includes("text/rtf")
  );
}

export function isHtmlUpload(filename: string, contentType?: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const normalizedType = contentType?.toLowerCase() ?? "";
  return (
    HTML_EXTENSIONS.has(ext) ||
    normalizedType.includes("text/html") ||
    normalizedType.includes("application/xhtml+xml")
  );
}
