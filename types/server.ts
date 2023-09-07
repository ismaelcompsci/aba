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
