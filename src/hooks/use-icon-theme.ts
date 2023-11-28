import { useAtom } from "jotai";
import { useTheme } from "tamagui";

import { appThemeAtom } from "../state/local-state";

const useIconTheme = () => {
  const [apptheme] = useAtom(appThemeAtom);
  const theme = useTheme();
  const bg = theme.background.get();
  const color = theme.color.get();
  const bgPress = theme.backgroundPress.get();
  const bgHover = theme.backgroundPress.get();
  const bgStrong = theme.backgroundStrong.get();
  const gray11 = theme.gray11.get();
  const iconColor =
    // @ts-ignore
    apptheme.color !== "no color" ? theme[apptheme.color + "10"] : color;

  const themeColor = iconColor;

  return {
    iconColor,
    bg,
    color,
    themeColor,
    bgPress,
    bgHover,
    bgStrong,
    gray11,
  };
};

export default useIconTheme;
