import { BookAnnotations } from "../components/epub-reader/rn-epub-reader";
import { GeneralSetting } from "../constants/storage-keys";
import { atomWithLocalStorage } from "../hooks/atom-hooks/atom-with-local-storage";
import { ServerSettings } from "../types/aba";
import { DeviceData, ServerConfig } from "../types/types";

import { DefaultSettings } from "./default-state";

export const deviceDataAtom = atomWithLocalStorage<DeviceData>(
  GeneralSetting.DeviceData,
  DefaultSettings.deviceData
);

export const appThemeAtom = atomWithLocalStorage(
  GeneralSetting.AppTheme,
  DefaultSettings.theme
);

export const serverSettingsAtom = atomWithLocalStorage<ServerSettings>(
  GeneralSetting.ServerSettings,
  {} as ServerSettings
);

export const currentServerConfigAtom = atomWithLocalStorage<ServerConfig>(
  GeneralSetting.CurrentServerConfig,
  {} as ServerConfig
);

export const sortAtom = atomWithLocalStorage<string>(GeneralSetting.Sort, "");

export const descOrderAtom = atomWithLocalStorage<boolean>(
  GeneralSetting.DescOrder,
  false
);

export const ebookSettignsAtom = atomWithLocalStorage(
  GeneralSetting.EbookSettings,
  DefaultSettings.ebookSettings
);

export const deviceIdAtom = atomWithLocalStorage<string | null>(
  GeneralSetting.DeviceId,
  null
);

export const bookAnnotationsAtom = atomWithLocalStorage<BookAnnotations>(
  GeneralSetting.BookAnnotations,
  {}
);
