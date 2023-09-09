export interface User {
  id: string;
  username: string;
  type: string;
  token: string;
  mediaProgress: any;
  seriesHideFromContinueListening: any[];
  bookmarks: any;
  isActive: boolean;
  isLocked: boolean;
  lastSeen: number;
  createdAt: number;
  permissions: any;
  librariesAccessible: any;
  itemTagsAccessible: any;
}
export interface ServerSettings {
  id: string;
  scannerFindCovers: boolean;
  scannerCoverProvider: string;
  scannerParseSubtitle: boolean;
  scannerPreferAudioMetadata: boolean;
  scannerPreferOpfMetadata: boolean;
  scannerPreferMatchedMetadata: boolean;
  scannerDisableWatcher: boolean;
  scannerPreferOverdriveMediaMarker: boolean;
  scannerUseTone: boolean;
  storeCoverWithItem: boolean;
  storeMetadataWithItem: boolean;
  metadataFileFormat: string;
  rateLimitLoginRequests: number;
  rateLimitLoginWindow: number;
  backupSchedule: string;
  backupsToKeep: number;
  maxBackupSize: number;
  backupMetadataCovers: boolean;
  loggerDailyLogsToKeep: number;
  loggerScannerLogsToKeep: number;
  homeBookshelfView: number;
  bookshelfView: number;
  sortingIgnorePrefix: boolean;
  sortingPrefixes: string[];
  chromecastEnabled: boolean;
  dateFormat: string;
  timeFormat: string;
  language: string;
  logLevel: number;
  version: string;
}

export interface LoginServerResponse {
  userDefaultLibraryId: string;
  user: User;
  serverSettings: ServerSettings;
}

type Shelf = "book" | "series" | "authors" | "episode" | "podcast";

export interface PersonalizedView {
  id: string;
  label: string;
  labelStringKey: string;
  type: Shelf;
  entities: LibraryItemMinified[];
  category: string;
}

/* type is book, podcast, or episode */
export interface LibraryItemMinified {
  id: string;
  ino: string;
  libraryId: string;
  folderId: string;
  path: string;
  relPath: string;
  isFile: boolean;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  addedAt: number;
  updatedAt: number;
  isMissing: boolean;
  isInvalid: boolean;
  mediaType: string;
  media: Book;
  numFiles: number;
  size: number;
}

export interface LibraryItem
  extends Omit<LibraryItemMinified, "media" | "numFiles" | "size"> {
  lastScan: number;
  scanVersion: string;
  libraryFiles: LibraryFile[];
  media: Book;
}

export interface Book {
  libraryItemId: string;
  metadata: BookMetadata;
  coverPath: string;
  tags: string[];
  audioFiles: AudioFile[];
  chapters: BookChapter[];
  missingParts: number[];
  ebookFile: EbookFile;
}

export interface Podcast {
  libraryItemId: string;
  metadata: PodcastMetadataMini;
  coverPath: string;
  tags: string[];
  episodes: any[];
  autoDownloadEpisodes: boolean;
  autoDownloadSchedule: string;
  lastEpisodeCheck: number;
  maxEpisodesToKeep: number;
  maxNewEpisodesToDownload: number;
}
export interface BookChapter {
  id: number;
  start: number;
  end: number;
  title: string;
}

export interface Series {
  id: string;
  name: string;
  description: any;
  addedAt: number;
  updatedAt: number;
}

export interface SeriesEntity extends Series {
  books: LibraryItemMinified[];
  inProgress: boolean;
  hasActiveBook: boolean;
  hideFromContinueListening: boolean;
  bookInProgressLastUpdate: number;
  firstBookUnread: LibraryItemMinified | null;
}

export interface BookMetadata {
  title: string;
  titleIgnorePrefix: string;
  subtitle: string | null;
  authors: any[];
  narrators: string[];
  series: any[];
  genres: string[];
  publishedYear: string;
  publishedDate: string | null;
  publisher: string;
  description: string;
  isbn: string | null;
  asin: string;
  language: string | null;
  explicit: boolean;
  authorName: string;
  authorNameLF: string;
  narratorName: string;
  seriesName: string;
}
export interface BookMetadataMini {
  title: string;
  titleIgnorePrefix: string;
  subtitle: any;
  authorName: string;
  authorNameLF: string;
  narratorName: string;
  seriesName: string;
  genres: string[];
  publishedYear: string;
  publishedDate: any;
  publisher: string;
  description: string;
  isbn: any;
  asin: string;
  language: any;
  explicit: boolean;
}

export interface Metadata {}

export interface PodcastMetadataMini {
  title: string;
  titleIgnorePrefix: string;
  author: string;
  description: string;
  releaseDate: string;
  genres: string[];
  feedUrl: string;
  imageUrl: string;
  itunesPageUrl: string;
  itunesId: number;
  itunesArtistId: number;
  explicit: boolean;
  language: any;
  type: string;
}

export interface LibraryFile {
  ino: string;
  metadata: FileMetadata;
  addedAt: number;
  updatedAt: number;
  fileType: string;
}

export interface File {
  ino: string;
  metadata: FileMetadata;
  addedAt: number;
  updatedAt: number;
  fileType: string;
}

export interface EbookFile extends Omit<File, "fileType"> {
  ebookFormat: string;
}

export interface AudioFile {
  index: number;
  ino: string;
  metadata: FileMetadata;
  addedAt: number;
  updatedAt: number;
  trackNumFromMeta: number;
  discNumFromMeta: number | null;
  trackNumFromFilename: number;
  discNumFromFilename: number | null;
  manuallyVerified: boolean;
  invalid: boolean;
  exclude: boolean;
  error: string | null;
  format: string;
  duration: number;
  bitRate: number;
  language: string | null;
  codec: string;
  timeBase: string;
  channels: number;
  channelLayout: string;
  chapters: BookChapter[];
  embeddedCoverArt: string | null;
  metaTags: AudioMetaTags;
  mimeType: string;
}

export interface FileMetadata {
  filename: string;
  ext: string;
  path: string;
  relPath: string;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
}

export interface AudioMetaTags {
  tagAlbum: string;
  tagArtist: string;
  tagGenre: string;
  tagTitle: string;
  tagSeries: any;
  tagSeriesPart: any;
  tagTrack: string;
  tagDisc: any;
  tagSubtitle: any;
  tagAlbumArtist: string;
  tagDate: any;
  tagComposer: string;
  tagPublisher: any;
  tagComment: any;
  tagDescription: any;
  tagEncoder: any;
  tagEncodedBy: any;
  tagIsbn: any;
  tagLanguage: any;
  tagASIN: any;
  tagOverdriveMediaMarker: any;
  tagOriginalYear: any;
  tagReleaseCountry: any;
  tagReleaseType: any;
  tagReleaseStatus: any;
  tagISRC: any;
  tagMusicBrainzTrackId: any;
  tagMusicBrainzAlbumId: any;
  tagMusicBrainzAlbumArtistId: any;
  tagMusicBrainzArtistId: any;
}
