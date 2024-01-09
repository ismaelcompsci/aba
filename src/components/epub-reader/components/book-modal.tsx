import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { X } from "@tamagui/lucide-icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTheme } from "tamagui";

import { IS_ANDROID } from "../../../constants/consts";
import { epubReaderOverviewModalAtom } from "../../../state/app-state";
import {
  AppBottomSheetModal,
  HandleBar,
} from "../../custom-components/bottom-sheet-modal";
import { Flex } from "../../layout/flex";
import { Screen } from "../../layout/screen";

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
      // renderBehindTopInse
      onClose={() => setEpubReaderOverviewModal(false)}
    >
      <HandleBar />

      {/* {IS_ANDROID ? (
        <Flex
          pos={"absolute"}
          $platform-ios={{
            right: -100,
            top: -30,
            height: 70,
            width: 200,
            transform: "rotate(45deg)",
            zIndex: 99999,
          }}
          $platform-android={{
            bottom: -30,
            left: -100,
            zIndex: 99999,
            height: 70,
            width: 200,
            transform: "rotate(45deg)",
          }}
          bg={"$backgroundPress"}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4,
          }}
        >
          <Flex
            $platform-ios={{
              left: 85,
              pos: "absolute",
              transform: "rotate(45deg)",
              bottom: 0,
              zIndex: 99999,
            }}
            $platform-android={{
              pos: "absolute",
              top: 0,
              left: 85,
              zIndex: 99999,
              transform: "rotate(45deg)",
            }}
            onPress={() => setEpubReaderOverviewModal(false)}
            pressStyle={{ opacity: 0.5 }}
          >
            <X />
          </Flex>
        </Flex>
      ) : null} */}

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width, height: height * 0.7 }}
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
