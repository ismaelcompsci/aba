import { atom } from "jotai";
import { focusAtom } from "jotai-optics";

import {
  LocationChange,
  TocItem,
} from "../components/epub-reader/rn-epub-reader";
import { EpubReaderLoading } from "../types/types";

import { ebookSettignsAtom } from "./local-state";

/* epub reader atoms */
export const epubReaderOverviewModalAtom = atom(false);
export const epubReaderShowMenuAtom = atom(false);
export const epubReaderTocAtom = atom<TocItem[] | null>(null);
export const epubReaderCurrentLocationAtom = atom<LocationChange | null>(null);
export const epubReaderSectionFractionsAtom = atom<number[] | null>(null);
export const epubReaderLoadingAtom = atom<EpubReaderLoading>({
  loading: false,
  part: "",
  percent: undefined,
});

/**
 * Menu
 */
export const epubReaderMenuThemeAtom = focusAtom(ebookSettignsAtom, (optic) =>
  optic.prop("theme")
);

export const epubReaderMenuScrolledAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("scrolled")
);

export const epubReaderMenuFontSizeAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("fontSize")
);

export const epubReaderMenuGapAtom = focusAtom(ebookSettignsAtom, (optic) =>
  optic.prop("gap")
);

export const epubReaderMenuLineHeightAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("lineHeight")
);

export const epubReaderMenuBlockSizeAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("maxBlockSize")
);

export const epubReaderMenuInlineSizeAtom = focusAtom(
  ebookSettignsAtom,
  (optic) => optic.prop("maxInlineSize")
);
