import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useAtomValue, useSetAtom } from "jotai";
import { useTheme } from "tamagui";

import { epubReaderOverviewModalAtom } from "../../../state/app-state";
import {
  AppBottomSheetModal,
  HandleBar,
} from "../../custom-components/bottom-sheet-modal";

import Annotations from "./tab-views/annotations";
import { Content } from "./tab-views/content";
import { Overview } from "./tab-views/overview";

const renderScene = SceneMap({
  overview: Overview,
  content: Content,
  annotations: Annotations,
});

export const BookInfoModal = () => {
  const epubReaderOverviewModal = useAtomValue(epubReaderOverviewModalAtom);

  if (!epubReaderOverviewModal) return null;

  return <BookInfo />;
};

export const BookInfo = () => {
  const { height, width } = useWindowDimensions();
  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);

  const colors = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "overview", title: "overview" },
    { key: "content", title: "Content" },
    { key: "annotations", title: "Annotations" },
  ]);

  return (
    <AppBottomSheetModal
      fullScreen
      hideHandlebar
      onClose={() => setEpubReaderOverviewModal(false)}
    >
      <HandleBar />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width, height }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: colors.background.get(),
            }}
            indicatorStyle={{ backgroundColor: colors.color.get() }}
            labelStyle={{
              color: colors.color.get(),
            }}
          />
        )}
      />
    </AppBottomSheetModal>
  );
};
