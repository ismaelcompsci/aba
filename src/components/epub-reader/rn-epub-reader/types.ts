import { string } from "zod";

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
  | { name: string; sortAs: string; identifier: string };

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
   * @param {ePubCfi[]} locations
   * @example
   * ```
   * <Reader
   *  src={{
   *    locations: ['epubcfi(/6/2...', 'epubcfi(/6/4...']
   *  }}
   * />
   * ```
   */
  initialLocations?: ePubCfi[];
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
   * Emit that the rendition has been resized
   * @param {any} layout
   * @returns {void} void
   */
  onResized?: (layout: any) => void;
  /**
   * Called when occurred a page change
   * @param {string} cfi
   * @param {number} progress
   * @param {number} totalPages
   * @returns {void} void
   */
  onLocationChange?: ({
    cfi,
    fraction,
    location,
    tocItem,
  }: LocationChange) => void;
  /**
   * Called once when the book has been searched
   * @param {SearchResult[]} results
   * @returns {void} void
   */
  onSearch?: (results: SearchResult[]) => void;
  /**
   * Called once the locations has been generated
   * @param {string} locations
   * @returns {void} void
   */
  onLocationsReady?: (epubKey: string, locations: ePubCfi[]) => void;
  /**
   * Called once a text selection has occurred
   * @param {SelectedText} selectedText
   * @returns {void} void
   */
  onSelected?: (selectedText: string, cfiRange: ePubCfi) => void;
  /**
   * Called when marked text is pressed
   * @param {SelectedText} selectedText
   * @returns {void} void
   */
  onMarkPressed?: (selectedText: string, cfiRange: ePubCfi) => void;
  /**
   * Called when screen orientation change is detected
   * @param {string} orientation
   * @returns {void} void
   */
  onOrientationChange?: (orientation: "-90" | "0" | "90") => void;
  /**
   * Called when the book is on the homepage
   * @returns {void} void
   */
  onBeginning?: () => void;
  /**
   * Called when the book is on the final page
   * @returns {void} void
   */
  onFinish?: () => void;
  /**
   * Emit that a section has been rendered
   * @param {any} section
   * @param {any} currentSection
   * @returns {void} void
   */
  onRendered?: (section: any, currentSection: any) => void;
  /**
   * Called when book layout is change
   * @param {string} layout
   * @returns {void} void
   */
  onLayout?: (layout: any) => void;
  /**
   * @param {any} toc
   * @returns {void} void
   */
  onNavigationLoaded?: (toc: any) => void;
  /**
   * Called when the book was pressed
   * @returns {void} void
   */
  onPress?: () => void;
  /**
   * Called when the book was double pressed
   * @returns {void} void
   */
  onDoublePress?: () => void;
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
   * Called when swipe left gesture is detected
   * @returns {void} void
   */
  onSwipeLeft?: () => void;
  /**
   * Called when swipe right gesture is detected
   * @returns {void} void
   */
  onSwipeRight?: () => void;
  /**
   * Render when the book is loading
   * @returns {JSX.Element} JSX.Element
   */
  renderLoadingFileComponent?: (props: LoadingFileProps) => JSX.Element;
  /**
   * Appears when the book is been rendering
   * @returns {JSX.Element} JSX.Element
   */
  renderOpeningBookComponent?: () => JSX.Element;
  /**
   * Enable text selection feature on the book
   * @default false
   * @description Recommend using this with `enableSwipe` disabled
   */
  enableSelection?: boolean;

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
}
