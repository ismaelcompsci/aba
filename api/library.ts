import { AxiosError } from "axios";
import { API, handleApiError } from "./API";
import { LibraryItem, PersonalizedView } from "../types/server";

/* https://api.audiobookshelf.org/#get-a-library-39-s-personalized-view */
export const getPersonalizedLibrary = async (currentLibraryId: string) => {
  try {
    const { data }: { data: PersonalizedView[] } = await API.get(
      `/api/libraries/${currentLibraryId}/personalized?minified=1&include=rssfeed`
    );

    return { error: null, data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const getLibraryItem = async (itemId: string) => {
  try {
    const { data }: { data: LibraryItem } = await API.get(
      `/api/items/${itemId}?expanded=1&include=rssfeed`
    );
    return { error: null, data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};
