import { SourceType } from "./enums/source-type.enum";

export function getSourceType(source: string): SourceType | undefined {
  if (source.includes("base64,") || source.length > 1000) {
    return SourceType.BASE64;
  }

  if (source.includes(".epub")) {
    return SourceType.EPUB;
  }

  if (source.includes(".cbz")) {
    return SourceType.CBZ;
  }
  if (source.includes(".azw3")) {
    return SourceType.CBZ;
  }

  if (source.includes(".fb2")) {
    return SourceType.FB2;
  }

  if (source.includes(".fbz")) {
    return SourceType.FBZ;
  }

  if (source.includes(".pdf")) {
    return SourceType.PDF;
  }

  if (source.includes(".mobi")) {
    return SourceType.MOBI;
  }

  if (source.includes(".opf")) {
    return SourceType.OPF;
  }
  return undefined;
}
