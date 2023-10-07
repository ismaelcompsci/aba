export type LibraryIcons =
  | "database"
  | "audiobookshelf"
  | "books-1"
  | "books-2"
  | "book-1"
  | "microphone-1"
  | "microphone-3"
  | "radio"
  | "podcast"
  | "rss"
  | "headphones"
  | "music"
  | "file-picture"
  | "rocket"
  | "power"
  | "star"
  | "heart";

export type Library = {
  id: string; // Read Only
  name: string;
  folders: Folder[];
  displayOrder: number;
  icon: LibraryIcons;
  mediaType: "book" | "podcast"; // Read Only
  provider: string;
  settings: LibrarySettings;
  createdAt: number; // Read Only
  lastUpdate: number; // Read Only
};

export type LibrarySettings = {
  coverAspectRatio: 0 | 1;
  disableWatcher: boolean;
  skipMatchingMediaWithAsin: boolean;
  skipMatchingMediaWithIsbn: boolean;
  autoScanCronExpression: string | null;
};
export type LibraryFilterData = {
  authors: AuthorMinified[];
  genres: string[];
  tags: string[];
  series: Series[];
  narrators: string[];
  languages: string[];
};

export type Folder = {
  id: string;
  fullPath: string;
  libraryId: string;
  addedAt: number;
};
// Define the PodcastEpisodeDownload type
export type PodcastEpisodeDownload = {
  id: string;
  episodeDisplayTitle: string;
  url: string;
  libraryItemId: string;
  libraryId: string;
  isFinished: boolean;
  failed: boolean;
  startedAt: number | null;
  createdAt: number;
  finishedAt: number | null;
  podcastTitle: string | null;
  podcastExplicit: boolean;
  season: string | null;
  episode: string | null;
  episodeType: string;
  publishedAt: number | null;
};

// Define the PodcastFeed type
export type PodcastFeed = {
  metadata: PodcastFeedMetadata;
  episodes: PodcastFeedEpisode[];
};

// Define the PodcastFeedMinified type
export type PodcastFeedMinified = Omit<PodcastFeed, "episodes"> & {
  metadata: PodcastFeedMetadata;
  numEpisodes: number;
};

export type PodcastFeedMetadata = {
  image: string;
  categories: string[];
  feedUrl: string;
  description: string;
  descriptionPlain: string;
  title: string;
  language: string;
  explicit: string;
  author: string;
  pubDate: string;
  link: string;
};

// Define the PodcastEpisode type
export type PodcastFeedEpisode = {
  title: string;
  subtitle: string;
  description: string;
  descriptionPlain: string;
  pubDate: string;
  episodeType: string;
  season: string;
  episode: string;
  author: string;
  duration: string;
  explicit: string;
  publishedAt: number;
  enclosure: PodcastEpisodeEnclosure;
};

export type PodcastMetadata = {
  title: string | null;
  author: string | null;
  description: string | null;
  releaseDate: string | null;
  genres: string[];
  feedUrl: string | null;
  imageUrl: string | null;
  itunesPageUrl: string | null;
  itunesId: number | null;
  itunesArtistId: number | null;
  explicit: boolean;
  language: string | null;
  type: string | null;
};

// Define the PodcastMetadata Minified export type by extending the base type
export type PodcastMetadataMinified = PodcastMetadata & {
  titleIgnorePrefix: string;
};

// Define the PodcastMetadata Expanded export type by extending the base type
export type PodcastMetadataExpanded = PodcastMetadata & {
  titleIgnorePrefix: string;
};

export type PodcastEpisode = {
  libraryItemId: string;
  id: string;
  index: number;
  season: string;
  episode: string;
  episodeType: string;
  title: string;
  subtitle: string;
  description: string;
  enclosure: PodcastEpisodeEnclosure;
  pubDate: string;
  audioFile: AudioFile;
  publishedAt: number;
  addedAt: number;
  updatedAt: number;
};

// Define the PodcastEpisode Expanded export type by extending the base type
export type PodcastEpisodeExpanded = PodcastEpisode & {
  audioTrack: AudioTrack;
  duration: number;
  size: number;
};

// Define the PodcastEpisodeEnclosure type
export type PodcastEpisodeEnclosure = {
  // Define attributes for Podcast Episode Enclosure here
  url: string;
  type: string;
  length: string;
};

// Define the base Podcast type
export type Podcast = {
  libraryItemId: string;
  metadata: PodcastMetadata;
  coverPath: string | null;
  tags: string[];
  episodes: PodcastEpisode[];
  autoDownloadEpisodes: boolean;
  autoDownloadSchedule: string; // Optional because it may not exist
  lastEpisodeCheck: number;
  maxEpisodesToKeep: number;
  maxNewEpisodesToDownload: number;
};

// Define the Podcast Minified export type by extending the base type
export type PodcastMinified = Omit<
  Podcast,
  "libraryItemId" | "episodes" | "metadata"
> & {
  numEpisodes: number;
  size: number;
  metadata: PodcastMetadataMinified;
};

// Define the Podcast Expanded export type by extending the base type
export type PodcastExpanded = Podcast & {
  size: number;
  episodes: PodcastEpisodeExpanded[]; // Array of Podcast Episodes Expanded // Todo
  metadata: PodcastMetadataExpanded;
};

export type Author = {
  id: string;
  asin: string | null;
  name: string;
  description: string | null;
  imagePath: string | null;
  addedAt: number;
  updatedAt: number;
};

// Define the Author Minified type by omitting certain attributes
export type AuthorMinified = Omit<
  Author,
  "asin" | "description" | "imagePath" | "addedAt" | "updatedAt"
>;

// Define the Author Expanded type by extending the base Author type
export type AuthorExpanded = Author & {
  numBooks: number;
};

export type Series = {
  id: string;
  name: string;
  description: string | null;
  addedAt: number;
  updatedAt: number;
};

export type SeriesNumBooks = Omit<
  Series,
  "description" | "addedAt" | "updatedAt"
> & {
  nameIgnorePrefix: string;
  libraryItemIds: string[];
  numBooks: number;
};
export type SeriesBooks = Omit<Series, "description" | "updatedAt"> & {
  nameIgnorePrefix: string;
  nameIgnorePrefixSort: string;
  type: string;
  books: LibraryItem[];
  totalDuration: number;
};

export type SeriesSequence = Omit<
  Series,
  "description" | "addedAt" | "updatedAt"
> & {
  sequence: string | null;
};

// Define the base BookMetadata type
export type BookMetadata = {
  title: string | null;
  subtitle: string | null;
  authors: AuthorMinified[];
  narrators: string[];
  series: SeriesSequence[];
  genres: string[];
  publishedYear: string | null;
  publishedDate: string | null;
  publisher: string | null;
  description: string | null;
  isbn: string | null;
  asin: string | null;
  language: string | null;
  explicit: boolean;
  authorName?: string;
};

// Define the BookMetadata Minified export type by extending the base type
export type BookMetadataMinified = Omit<
  BookMetadata,
  "authors" | "narrators" | "series"
> & {
  titleIgnorePrefix: string;
  authorName: string;
  authorNameLF: string;
  narratorName: string;
  seriesName: string;
};

// Define the BookMetadata Expanded export type by extending the base type
export type BookMetadataExpanded = BookMetadata & {
  titleIgnorePrefix: string;
  authorName: string;
  authorNameLF: string;
  narratorName: string;
  seriesName: string;
};

// Define a export type for the book chapter
export type BookChapter = {
  /* Define the properties of the book chapter here */
  id: number;
  start: number;
  end: number;
  title: string;
};

// Define a export type for the ebook file
export type EbookFile = {
  /* Define the properties of the ebook file here */
  ino: string;
  metadata: FileMetadata;
  ebookFormat: string;
  addedAt: number;
  updatedAt: number;
};

// Define a export type for the audio track
export type AudioTrack = {
  index: number;
  startOffset: number;
  duration: number;
  title: string;
  contentUrl: string;
  mimeType: string;
  metadata: FileMetadata;
};

// Define the base Book type
export type Book = {
  libraryItemId: string; // Optional because it's not present in Book Minified
  metadata: BookMetadata;
  coverPath: string | null;
  tags: string[];
  audioFiles: AudioFile[];
  chapters: BookChapter[]; // Optional because it's not present in Book Minified
  missingParts: number[]; // Optional because it's not present in Book Minified
  ebookFile: EbookFile | null; // Optional because it's not present in Book Minified
};

// Define the Book Minified export type by extending the base type
export type BookMinified = Omit<
  Book,
  | "libraryItemId"
  | "audioFiles"
  | "chapters"
  | "missingParts"
  | "ebookFile"
  | "metadata"
> & {
  metadata: BookMetadataMinified;
  numTracks: number;
  numAudioFiles: number;
  numChapters: number;
  numMissingParts: number;
  numInvalidAudioFiles: number;
  duration: number;
  size: number;
  ebookFormat: string | null;
};

// Define the Book Expanded export type by extending the base type
export type BookExpanded = Book & {
  duration: number; // Adding duration and size to the base type
  size: number;
  tracks: AudioTrack[];
  metadata: BookMetadataExpanded;
};

export type Media = Book | Podcast;
export type MediaMinified = BookMinified | PodcastMinified;
export type MediaExpanded = BookExpanded | PodcastExpanded;

export type LibraryItem = {
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
  lastScan: number | null;
  scanVersion: string | null;
  isMissing: boolean;
  isInvalid: boolean;
  mediaType: "book" | "podcast";
  media: Media;
  libraryFiles: LibraryFile[];
};

export type LibraryItemMinified = Omit<
  LibraryItem,
  "lastScan" | "scanVersion" | "libraryFiles" | "media"
> & {
  media: MediaMinified;
  numFiles: number;
  size: number;
};

// Define the LibraryItem Expanded export type by extending the base type
export type LibraryItemExpanded = Omit<LibraryItem, "media"> & {
  media: MediaExpanded;
  size: number;
};

// Define the Collection type
export type Collection = {
  id: string;
  libraryId: string;
  userId: string;
  name: string;
  description: string | null;
  books: LibraryItem[];
  lastUpdate: number;
  createdAt: number;
};

export type CollectionExpanded = Omit<Collection, "books"> & {
  books: LibraryItemExpanded[];
};

export type Playlist = {
  id: string;
  libraryId: string;
  userId: string;
  name: string;
  description: string | null;
  coverPath: string | null;
  items: PlaylistItem[];
  lastUpdate: number;
  createdAt: number;
};

export type PlaylistExpanded = Omit<Playlist, "items"> & {
  items: PlaylistItemExpanded[];
};

// Define the PlaylistItem type
export type PlaylistItem = {
  libraryItemId: string;
  episodeId: string | null; // Nullable if playlist item is for a podcast episode
};

// Define the PlaylistItemExpanded type
export type PlaylistItemExpanded = PlaylistItem & {
  episode?: PodcastEpisodeExpanded; // Optional podcast episode details, if episodeId is not null
  libraryItem: LibraryItemExpanded | LibraryItemMinified; // Library item details, based on whether episodeId is null
};

export type MediaProgress = {
  id: string;
  libraryItemId: string;
  episodeId: string;
  duration: number;
  progress: number;
  currentTime: number;
  isFinished: boolean;
  hideFromContinueListening: boolean;
  lastUpdate: number;
  startedAt: number;
  finishedAt: number | null;
  ebookLocation?: string;
};

export type MediaProgressWithMedia = MediaProgress & {
  media: MediaExpanded;
  episode: PodcastEpisode;
};

export type DeviceInfo = {
  ipAddress: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: string | null;
  manufacturer: string | null;
  model: string | null;
  sdkVersion: number | null;
  serverVersion: string;
};

export enum PlaybackMethod {
  DirectPlay,
  DirectStream,
  Transcode,
  Local,
}

export type PlaybackSession = {
  id: string;
  userId: string;
  libraryId: string;
  libraryItemId: string;
  episodeId: string | null; // Nullable if playback session was started without an episode ID
  mediaType: "book" | "podcast";
  mediaMetadata: BookMetadata | PodcastMetadata; // Use the actual types for BookMetadata and PodcastMetadata
  chapters?: BookChapter[]; // Optional if the media type is a book
  displayTitle: string;
  displayAuthor: string;
  coverPath: string;
  duration: number; // Duration in seconds
  playMethod: PlaybackMethod;
  mediaPlayer: string;
  deviceInfo: DeviceInfo;
  date: string; // Format: YYYY-MM-DD
  dayOfWeek: string;
  timeListening: number; // Time in seconds
  startTime: number; // Time in seconds
  currentTime: number; // Time in seconds
  startedAt: number; // Time in ms since POSIX epoch
  updatedAt: number; // Time in ms since POSIX epoch
};

export type VideoTrack = any;

// Define the PlaybackSessionExpanded type
export type PlaybackSessionExpanded = PlaybackSession & {
  audioTracks: AudioTrack[]; // Optional array of audio tracks
  videoTrack?: VideoTrack | null; // Optional video track or null
  libraryItem: LibraryItem; // Optional library item details
};

export type User = {
  id: string;
  username: string;
  type: string;
  token: string;
  mediaProgress: MediaProgress[];
  seriesHideFromContinueListening: string[];
  bookmarks: AudioBookmark[];
  isActive: boolean;
  isLocked: boolean;
  lastSeen: number | null;
  createdAt: number;
  permissions: UserPermissions;
  librariesAccessible: string[];
  itemTagsAccessible: string[];
};

export type UserWithProgressDetails = Omit<User, "mediaProgress"> & {
  mediaProgress: MediaProgressWithMedia[];
};

export type UserWithSessionAndMostRecentProgress = Omit<
  User,
  | "mediaProgress"
  | "seriesHideFromContinueListening"
  | "bookmarks"
  | "isActive"
  | "isLocked"
  | "settings"
  | "permissions"
  | "librariesAccessible"
  | "itemTagsAccessible"
> & {
  session: PlaybackSessionExpanded | null;
  mostRecent: MediaProgressWithMedia | null;
};
export type LibraryFile = {
  ino: string;
  metadata: FileMetadata;
  addedAt: number;
  updatedAt: number;
  fileType: string;
};

export type FileMetadata = {
  filename: string;
  ext: string;
  path: string;
  relPath: string;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
};

export type UserPermissions = {
  download: boolean;
  update: boolean;
  delete: boolean;
  upload: boolean;
  accessAllLibraries: boolean;
  accessAllTags: boolean;
  accessExplicitContent: boolean;
};
export type AudioBookmark = {
  libraryItemId: string;
  title: string;
  time: number;
  createdAt: number;
};

export type ServerSettings = {
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
};

export type Backup = {
  id: string;
  backupMetadataCovers: boolean;
  backupDirPath: string;
  datePretty: string;
  fullPath: string;
  path: string;
  filename: string;
  fileSize: number;
  createdAt: number;
  serverVersion: string;
};

export type NotificationSettings = {
  id: string;
  appriseType: string;
  appriseApiUrl: string;
  notifications: Notification[];
  maxFailedAttempts: number;
  maxNotificationQueue: number;
  notificationDelay: number;
};
export type Notification = {
  id: string;
  libraryId: string | null;
  eventName: string;
  urls: string[];
  titleTemplate: string;
  bodyTemplate: string;
  enabled: boolean;
  type: string;
  lastFiredAt: number;
  lastAttemptFailed: boolean;
  numConsecutiveFailedAttempts: number;
  numTimesFired: number;
  createdAt: number;
};

export type NotificationEvent = {
  name: string;
  requiresLibrary: boolean;
  libraryMediaType: string;
  description: string;
  variables: string[];
  defaults: {
    title: string;
    body: string;
  };
  testData: {
    libraryItemId: string;
    libraryId: string;
    libraryName: string;
    podcastTitle: string;
    episodeId: string;
    episodeTitle: string;
  };
};

export type RSSFeedMetadata = {
  title: string;
  description: string | null;
  author: string | null;
  imageUrl: string;
  feedUrl: string;
  link: string;
  explicit: boolean;
  type: string | null;
  language: string | null;
  preventIndexing: boolean;
  ownerName: string | null;
  ownerEmail: string | null;
};

export type RSSFeed = {
  id: string;
  slug: string;
  userId: string;
  entityType: string;
  entityId: string;
  coverPath: string;
  serverAddress: string;
  feedUrl: string;
  meta: RSSFeedMetadata;
  episodes: RSSFeedEpisode[];
  createdAt: number;
  updatedAt: number;
};

// Define the RSS Feed Minified type by omitting certain attributes and modifying 'meta' attribute
export type RSSFeedMinified = Omit<
  RSSFeed,
  | "slug"
  | "userId"
  | "coverPath"
  | "serverAddress"
  | "episodes"
  | "createdAt"
  | "updatedAt"
> & {
  meta: RSSFeedMetadataMinified;
};

export type RSSFeedMetadataMinified = Omit<
  RSSFeedMetadata,
  "author" | "imageUrl" | "feedUrl" | "link" | "explicit" | "type" | "language"
>;

export type RSSFeedEpisode = {
  id: string;
  title: string;
  description: string;
  enclosure: {
    url: string;
    type: string;
    size: number;
  };
  pubDate: string;
  link: string;
  author: string;
  explicit: boolean;
  duration: number;
  season: string | null;
  episode: string | null;
  episodeType: string | null;
  libraryItemId: string;
  episodeId: string;
  trackIndex: number;
  fullPath: string;
};

export type StreamProgress = {
  stream: string;
  percent: string;
  chunks: string[];
  numSegments: number;
};

export type Stream = {
  id: string;
  userId: string;
  libraryItem: LibraryItemExpanded;
  episode: PodcastEpisodeExpanded;
  segmentLength: number;
  playlistPath: string;
  clientPlaylistUri: string;
  startTime: number;
  segmentStartNumber: number;
  isTranscodeComplete: boolean;
};

export type AudioFile = {
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
};

export type AudioMetaTags = {
  tagAlbum?: string;
  tagArtist?: string;
  tagGenre?: string;
  tagTitle?: string;
  tagSeries?: string | null;
  tagSeriesPart?: string | null;
  tagTrack?: string;
  tagDisc?: string | null;
  tagSubtitle?: string | null;
  tagAlbumArtist?: string;
  tagDate?: string | null;
  tagComposer?: string;
  tagPublisher?: string | null;
  tagComment?: string | null;
  tagDescription?: string | null;
  tagEncoder?: string | null;
  tagEncodedBy?: string | null;
  tagIsbn?: string | null;
  tagLanguage?: string | null;
  tagASIN?: string | null;
  tagOverdriveMediaMarker?: string | null;
  tagOriginalYear?: string | null;
  tagReleaseCountry?: string | null;
  tagReleaseType?: string | null;
  tagReleaseStatus?: string | null;
  tagISRC?: string | null;
  tagMusicBrainzTrackId?: string | null;
  tagMusicBrainzAlbumId?: string | null;
  tagMusicBrainzAlbumArtistId?: string | null;
  tagMusicBrainzArtistId?: string | null;
};
