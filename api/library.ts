import { AxiosError } from "axios";
import { API, handleApiError } from "./API";
import { LibraryItems, LibrarySeries, PersonalizedView } from "../types/server";
import { Library } from "../types/adbs";

/* https://api.audiobookshelf.org/#get-all-libraries */
export const getLibraries = async () => {
  try {
    const { data }: { data: { libraries: Library[] } } = await API.get(
      "/api/libraries"
    );

    return { error: null, data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

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
    const { data } = await API.get(
      `/api/items/${itemId}?expanded=1&include=rssfeed`
    );
    return { error: null, data };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const getLibraryItems = async ({
  libraryId,
  limit,
  pageParam,
}: {
  libraryId: string;
  limit: number;
  pageParam: number;
}) => {
  const { data }: { data: LibraryItems } = await API.get(
    `/api/libraries/${libraryId}/items`,
    {
      params: {
        limit: limit,
        page: pageParam,
        minified: 1,
        include: "rssfeed,numEpisodesIncomplete",
      },
    }
  );

  return { data, nextPage: pageParam + 1 };
};

export const getLibrarySeries = async ({
  libraryId,
  limit,
  pageParam,
}: {
  libraryId: string;
  limit: number;
  pageParam: number;
}) => {
  const { data }: { data: LibrarySeries } = await API.get(
    `/api/libraries/${libraryId}/series`,
    {
      params: {
        limit: limit,
        page: pageParam,
        minified: 1,
        include: "rssfeed,numEpisodesIncomplete",
      },
    }
  );

  return { data, nextPage: pageParam + 1 };
};
