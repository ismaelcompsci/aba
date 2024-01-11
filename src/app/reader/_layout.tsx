import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { useAtomValue } from "jotai";

import { BookInfoModal } from "../../components/epub-reader/components/book-modal";
import { Menu } from "../../components/epub-reader/components/menu/menu";
import {
  ReaderProvider,
  useReader,
} from "../../components/epub-reader/rn-epub-reader";
import { useOrientation } from "../../hooks/use-orientation";
import { ebookSettignsAtom } from "../../state/local-state";

const layout = () => {
  return (
    <ReaderProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Menu />
      <BookInfoModal />
      <ThemeUpdater />
    </ReaderProvider>
  );
};

const ThemeUpdater = () => {
  const settings = useAtomValue(ebookSettignsAtom);
  const { changeTheme } = useReader();
  const orientation = useOrientation();
  const { width } = useWindowDimensions();

  useEffect(() => {
    changeTheme(settings);
  }, [settings]);

  useEffect(() => {}, [width, orientation]);
  return null;
};

export default layout;
