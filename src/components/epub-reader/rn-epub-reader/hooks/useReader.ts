import { useContext } from "react";

import { ReaderContext, ReaderContextProps } from "../context";

export function useReader() {
  const {
    openMenu,
    setAnnotations,
    useMenuAction,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    isLoading,
    isRendering,
    setIsPdf,
    isPdf,
    cover,
  } = useContext(ReaderContext);

  return {
    openMenu,
    setAnnotations,
    useMenuAction,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    isRendering,
    isLoading,
    isPdf,
    cover,
    setIsPdf,
  } as Pick<
    ReaderContextProps,
    | "changeTheme"
    | "goToLocation"
    | "goPrevious"
    | "goNext"
    | "isLoading"
    | "isRendering"
    | "setIsPdf"
    | "isPdf"
    | "cover"
    | "useMenuAction"
    | "setAnnotations"
    | "openMenu"
  >;
}
