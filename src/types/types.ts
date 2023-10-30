import {
  LibraryItem,
  LibraryItemExpanded,
  LibraryItemMinified,
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

export type TabName = "Home" | "Library" | "Series";

export type Tabs = {
  [key in TabName]: React.ComponentType<any>; // Assuming Home and Library are React components
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
