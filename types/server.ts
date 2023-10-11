import {
  LibraryItem,
  LibraryItemMinified,
  Series,
  SeriesBooks,
  SeriesBooksMinified,
  ServerSettings,
  User,
} from "./adbs";

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
