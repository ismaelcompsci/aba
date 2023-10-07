import { LibraryItemMinified, Series, ServerSettings, User } from "./adbs";

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
