import { Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

export const IS_ANDROID = Platform.OS === "android";
export const IS_IOS = Platform.OS === "ios";

export const LIBRARY_INFINITE_LIMIT = 30;
export const SERIES_INFINITE_LIMIT = 30;

export const epubDir = RNFetchBlob.fs.dirs.DocumentDir + "/epub";

export const progressFilters = [
  "finished",
  "not-started",
  "not-finished",
  "in-progress",
];

// https://github.com/advplyr/audiobookshelf-app/blob/6b164bdb276b835df9d0dc14bf43c43910009fa9/components/modals/OrderModal.vue#L30C18-L67C8
export const sorts = [
  {
    text: "Title",
    value: "media.metadata.title",
  },
  {
    text: "Author (First Last)",
    value: "media.metadata.authorName",
  },
  {
    text: "Author (Last, First)",
    value: "media.metadata.authorNameLF",
  },
  {
    text: "Published Year",
    value: "media.metadata.publishedYear",
  },
  {
    text: "Added At",
    value: "addedAt",
  },
  {
    text: "Size",
    value: "size",
  },
  {
    text: "Duration",
    value: "media.duration",
  },
  {
    text: "File Birthtime",
    value: "birthtimeMs",
  },
  {
    text: "File Modified",
    value: "mtimeMs",
  },
];
