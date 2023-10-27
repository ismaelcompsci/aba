import { useContext } from "react";

import { ReaderContext, ReaderContextProps } from "../context";

export function useReader() {
  const {
    // changeFontFamily,
    changeTheme,
    // goToLocation,
    // goPrevious,
    // goNext,
    // getLocations,
    // getCurrentLocation,
    // getMeta,
    // search,
    // addMark,
    // removeMark,
    theme,
    // atStart,
    // atEnd,
    // totalLocations,
    // currentLocation,
    // progress,
    // locations,
    isLoading,
    isRendering,
    // key,
    // searchResults,
  } = useContext(ReaderContext);

  return {
    // changeFontFamily,
    changeTheme,
    // goToLocation,
    // goPrevious,
    // goNext,
    // getLocations,
    // getCurrentLocation,
    // getMeta,
    // search,
    // addMark,
    // removeMark,
    theme,
    // atStart,
    // atEnd,
    // totalLocations,
    // currentLocation,
    // progress,
    // locations,
    isRendering,
    isLoading,
    // key,
    // searchResults,
  } as Pick<
    ReaderContextProps,
    // | "changeFontFamily"
    | "changeTheme"
    // | "goToLocation"
    // | "goPrevious"
    // | "goNext"
    // | "getLocations"
    // | "getCurrentLocation"
    // | "getMeta"
    // | "search"
    // | "addMark"
    // | "removeMark"
    | "theme"
    // | "atStart"
    // | "atEnd"
    // | "totalLocations"
    // | "currentLocation"
    // | "progress"
    // | "locations"
    | "isLoading"
    | "isRendering"
    // | "key"
    // | "searchResults"
  >;
}
