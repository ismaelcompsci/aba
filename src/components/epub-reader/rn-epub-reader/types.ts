/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebViewCustomMenuItems } from "react-native-webview/lib/WebViewTypes";

export type BookAnnotations = {
  [key: string]: Annotation[];
};

export type ShowAnnotation = {
  index: number;
  pos: { dir: string; point: { x: number; y: number } };
  value: string;
};

export type MenuActions =
  | { action: "copy"; color?: string }
  | { action: "highlight"; color: string }
  | { action: "underline"; color: string }
  | { action: "strikethrough"; color: string }
  | { action: "squiggly"; color: string }
  | { action: "speak_from_here"; color?: string };

export type MenuSelectionEvent = {
  nativeEvent: {
    label: string;
    key: string;
    selectedText: string;
  };
};

export type Annotation = {
  index: number;
  value: string;
  color: string;
  text: string;
  note?: string;
  created: string;
  modified: string;
};

export type Location = {
  current: number;
  next: number;
  total: number;
};

export type TocItem = {
  href: string;
  id: number;
  label: string;
  subitems?: any[] | null;
};

type Contributor =
  | string
  | string[]
  | {
      name: {
        [key: string]: string;
      };
    }
  | { name: string; sortAs: string; identifier?: string }
  | { name: string; sortAs: string; identifier?: string }[];

export type ReaderBookMetadata = {
  title:
    | string
    | {
        [key: string]: string;
      };
  subtitle?:
    | string
    | {
        [key: string]: string;
      };
  identifier?: string;
  author?: Contributor;
  translator?: Contributor;
  editor?: Contributor;
  artist?: Contributor;
  illustrator?: Contributor;
  letterer?: Contributor;
  penciler?: Contributor;
  colorist?: Contributor;
  inker?: Contributor;
  narrator?: Contributor;
  language?: string | string[];
  description?: string;
  publisher?: string | { name: string; sortAs: string; identifier: string };
  published?: string;
  modified?: string;
  subject?:
    | string
    | string[]
    | { name: string; sortAs: string; code: string; scheme: string };
  summary?: string;
};

export type ReaderBook = {
  metadata: ReaderBookMetadata;
  toc: TocItem[];
  sectionFractions: number[];
};

export type LocationChange = {
  cfi: string;
  fraction: number;
  location: Location;
  tocItem: TocItem;
  pageItem: any | null;
  section: Section;
  time?: { section: number; total: number };
};

export type Section = { current: string; total: string };

export type Theme = {
  lineHeight: number;
  justify: boolean;
  hyphenate: boolean;
  gap: number;
  maxInlineSize: number;
  maxBlockSize: number;
  maxColumnCount: number;
  scrolled: boolean;
  fontSize: number;
  theme: "dark" | "light" | "sepia";
};

export type Mark = "highlight" | "underline";

export type FontSize = string;

/**
 * @example
 * ````
 * epubcfi(/6/6!/4/2,/2/2/1:0,/4[q1]/2/14/2/1:14)
 * ````
 */
export type ePubCfi = string;

export type SearchResult = {
  cfi: ePubCfi;
  excerpt: string;
};

export type LoadingFileProps = {
  fileSize: number;
  downloadProgress: number;
  downloadSuccess: boolean;
  downloadError: string | null;
};

type FileSystem = {
  file: string | null;
  progress: number;
  downloading: boolean;
  size: number;
  error: string | null;
  success: boolean;
  downloadFile: (
    fromUrl: string,
    toFile: string
  ) => Promise<{ uri: string | null; mimeType: string | null }>;
  getFileInfo: (fileUri: string) => Promise<{
    uri: string;
    exists: boolean;
    isDirectory: boolean;
    size: number | undefined;
  }>;
};

export interface ReaderProps {
  /**
   * Can be a `base64`, `epub`, `opf` or `binary`.
   * @param {object} src
   */
  src: string;
  /**
   * @param {boolean} show
   * @returns {void}
   */
  onShowNext?: (show: boolean, label: string) => void;
  /**
   * @param {boolean} show
   * @returns {void}
   */
  onShowPrevious?: (show: boolean, label: string) => void;
  /**
   * Called once the book loads is started
   * @returns {void} void
   */
  onStarted?: () => void;
  /**
   * Called once book has been displayed
   * @returns {void} void
   */
  onReady?: (book: ReaderBook) => void;
  /**
   * Called once book has not been displayed
   * @param {string} reason
   * @returns {void} void
   */
  onDisplayError?: (reason: string) => void;
  /**
   * Called when occurred a page change
   */
  onLocationChange?: ({
    cfi,
    fraction,
    location,
    tocItem,
  }: LocationChange) => void;

  renderLoadingFileComponent?: (props: LoadingFileProps) => JSX.Element;
  /**
   * Called when book layout is change
   * @param {string} layout
   * @returns {void} void
   */
  onLayout?: (layout: any) => void;
  /**
   * Called when the book was pressed
   * @returns {void} void
   */
  onPress?: () => void;
  /**
   * width of the ePub Rendition
   * @param {number} width
   */
  width: number;
  /**
   * height of the ePub Rendition
   * @param {number} height
   */
  height: number;
  /**
   * Can be an ePubCfi or chapter url
   */
  initialLocation?: string;
  /**
   * Enable swipe actions
   * @default true
   */
  enableSwipe?: boolean;
  /**
   * @param theme {@link Theme}
   * @example
   * ```
   * <Reader
   *  defaultTheme={{ "body": { "color": "black" } }}
   * />
   * ```
   */
  defaultTheme?: Theme;

  fileSystem(): FileSystem;
  menuItems?: WebViewCustomMenuItems[] | undefined;
  onCustomMenuSelection?: ((event: MenuSelectionEvent) => void) | undefined;
  onNewAnnotation?: (annotation: Annotation) => void;
  onAnnotationClick?: ({ index, pos, value }: ShowAnnotation) => void;
}
