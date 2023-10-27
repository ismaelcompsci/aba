import { useCallback } from "react";

import template from "../template";

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
      const bookLocation = location ? `'${location}'` : "undefined";

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
          `const bookLocation = ${bookLocation};`
        );
    },
    []
  );
  return { injectWebVieWVariables };
}
