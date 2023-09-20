import { useContext } from "react";
import { ReaderContext, ReaderContextProps } from "../context";

export function useReader() {
  const {
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    getLocations,
    getCurrentLocation,
    getMeta,
    search,
    addMark,
    removeMark,
    theme,
    atStart,
    atEnd,
    totalLocations,
    currentLocation,
    progress,
    locations,
    isLoading,
    key,
    searchResults,
    changePageFlow,
  } = useContext(ReaderContext);

  return {
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    getLocations,
    getCurrentLocation,
    getMeta,
    search,
    addMark,
    removeMark,
    theme,
    atStart,
    atEnd,
    totalLocations,
    currentLocation,
    progress,
    locations,
    isLoading,
    key,
    searchResults,
    changePageFlow,
  } as Pick<
    ReaderContextProps,
    | "changeFontSize"
    | "changeFontFamily"
    | "changeTheme"
    | "goToLocation"
    | "goPrevious"
    | "goNext"
    | "getLocations"
    | "getCurrentLocation"
    | "getMeta"
    | "search"
    | "addMark"
    | "removeMark"
    | "theme"
    | "atStart"
    | "atEnd"
    | "totalLocations"
    | "currentLocation"
    | "progress"
    | "locations"
    | "isLoading"
    | "key"
    | "searchResults"
    | "changePageFlow"
  >;
}
