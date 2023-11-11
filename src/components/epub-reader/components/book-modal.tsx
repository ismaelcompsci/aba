import { useState } from "react";
import { Modal, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { X } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { View, XStack } from "tamagui";

import useIconTheme from "../../../hooks/use-icon-theme";
import { epubReaderOverviewModalAtom } from "../../../state/app-state";

import { Content } from "./tab-views/content";
import { Overview } from "./tab-views/overview";

const renderScene = SceneMap({
  overview: Overview,
  content: Content,
});

export const BookChapterModal = () => {
  const { height, width } = useWindowDimensions();
  const [epubReaderOverviewModal, setEpubReaderOverviewModal] = useAtom(
    epubReaderOverviewModalAtom
  );

  const { color, bgStrong } = useIconTheme();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "overview", title: "overview" },
    { key: "content", title: "Content" },
  ]);

  return (
    <Modal
      presentationStyle="pageSheet"
      animationType="slide"
      visible={epubReaderOverviewModal}
      onRequestClose={() => setEpubReaderOverviewModal(false)}
      statusBarTranslucent
    >
      <XStack
        pos={"absolute"}
        right={-100}
        top={-30}
        height={70}
        width={200}
        transform={"rotate(45deg)"}
        backgroundColor={"$backgroundPress"}
        zi={99999}
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
        <View
          left={85}
          pos={"absolute"}
          transform={"rotate(45deg)"}
          bottom={0}
          zIndex={99999}
          onPress={() => setEpubReaderOverviewModal(false)}
          pressStyle={{ opacity: 0.5 }}
        >
          <X />
        </View>
      </XStack>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width, height }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: bgStrong,
            }}
            indicatorStyle={{ backgroundColor: color }}
            labelStyle={{
              color: color,
            }}
          />
        )}
      />
    </Modal>
  );
};
