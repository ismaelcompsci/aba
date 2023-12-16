/* eslint-disable @typescript-eslint/no-explicit-any */
import { Track } from "react-native-track-player";

import {
  BookMetadata,
  CollectionMinified,
  LibraryItem,
  LibraryItemExpanded,
  LibraryItemMinified,
  PlaybackSession,
  PodcastEpisodeExpanded,
  PodcastMetadata,
  PodcastMinified,
  Series,
  SeriesBooksMinified,
  ServerSettings,
  User,
} from "./aba";

export type ServerConfig = {
  serverAddress: string;
  username: string;
  userId: string;
  token: string;
  index: number;
  name: string;
  id: string;
};

export type DeviceData = {
  serverConnectionConfigs: ServerConfig[];
  lastServerConnectionConfigId: string | undefined | null;
};

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

export interface LibraryItems {
  results: LibraryItemMinified[];
  total: number;
  limit: number;
  page: number;
  sortBy: string;
  sortDesc: boolean;
  filterBy: string;
  mediaType: string;
  minified: boolean;
  collapseseries: boolean;
  include: string;
}

export interface LibrarySeries {
  results: SeriesBooksMinified[];
  total: number;
  limit: number;
  page: number;
  sortBy: string;
  sortDesc: boolean;
  filterBy: string;
  mediaType: string;
  minified: boolean;
  collapseseries: boolean;
  include: string;
}

export interface LibraryCollections {
  results: CollectionMinified[];
  total: number;
  limit: number;
  page: number;
  sortBy: string;
  sortDesc: boolean;
  filterBy: string;
  minified: boolean;
  include: string;
}

export type TabName =
  | "Home"
  | "Library"
  | "Series"
  | "Latest"
  | "Add"
  | "Collections"
  | "Playlists"
  | "Authors";

export type Tabs<T> = {
  [key in TabName]: React.ComponentType<T>; // Assuming Home and Library are React components
};

export type EpubReaderLoading = {
  loading: boolean;
  part?: string;
  percent?: number;
};

export interface SearchResult {
  libraryItem: LibraryItemExpanded;
  matchKey: string | null;
  matchText: string | null;
}

export type SearchSeriesResult = { books: LibraryItem[]; series: Series };
export type SearchNarratorResult = { name: string; numBook: number };

export type AudioPlayerTrack = {
  id: number;
  url: string;
  duration?: number;
  title?: string;
  startOffset: number;
};

export interface AudioPlayerTrackExtra extends Track, AudioPlayerTrack {}

export type PlayingState = {
  open: boolean;
  playing: boolean;
  libraryItemId?: string;
  startTime?: number;
  episodeId?: string;
  chapterId?: number;
};

export type ListeningStats = {
  totalTime: number;
  items: {
    [key: string]: {
      id: string;
      timeListening: number;
      mediaMetadata: BookMetadata | PodcastMetadata;
    };
  };
  days: {
    [key: string]: number;
  };
  dayOfWeek: {
    [key: string]: number;
  };
  today: number;
  recentSessions: PlaybackSession[];
};

export type PodcastEpisodeWithPodcast = PodcastEpisodeExpanded & {
  podcast: PodcastMinified;
};

export type RecentEpisodesResponse = {
  episodes: PodcastEpisodeWithPodcast[];
  total: number;
  limit: number;
  page: number;
};

export type PodcastSearch = {
  [x: string]: string;
  id: number;
  artistId: number;
  title: string;
  artistName: string;
  description: string;
  descriptionPlain: string;
  releaseDate: string;
  genres: string[];
  cover: string;
  trackCount: number;
  feedUrl: string;
  pageUrl: string;
  explicit: boolean;
};

export type CreatePlaylistModalAtom = {
  open: boolean;
  libraryItemId?: string;
  episodeId?: string;
  libraryId?: string;
};

export type BaseModalAtom = {
  open: boolean;
};

export type BookmarksModalAtom = BaseModalAtom & {
  libraryItemId?: string;
};
