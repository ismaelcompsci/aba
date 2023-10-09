import { useCallback } from "react";
import type { Theme, ePubCfi } from "../types";
import template from "../template";
import type { SourceType } from "../utils/enums/source-type.enum";

export function useInjectWebVieWVariables() {
  const injectWebVieWVariables = useCallback(
    ({
      pdf,
      foliate,
      book,
      location,
    }: {
      pdf: string;
      foliate: string;
      book: string;
      location?: string;
    }) => {
      return template
        .replace(
          /<script id="pdf"><\/script>/,
          `<script src="${pdf}"></script>`
        )
        .replace(
          /<script id="foliate"><\/script>/,
          `<script src="${foliate}"></script>`
        )
        .replace(/const bookPath = undefined;/, `const bookPath = '${book}';`)
        .replace(
          /const bookLocation = undefined;/,
          `const bookLocation = '${location}';`
        );
    },
    []
  );
  return { injectWebVieWVariables };
}
