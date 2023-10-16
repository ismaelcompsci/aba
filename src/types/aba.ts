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

export type AudioBookmark = {
  libraryItemId: string;
  title: string;
  time: number;
  createdAt: number;
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
