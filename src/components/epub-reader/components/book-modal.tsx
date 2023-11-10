import { useState } from "react";
import { Modal, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { X } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { View } from "tamagui";

import useIconTheme from "../../../hooks/use-icon-theme";
import { epubReaderOverviewModalAtom } from "../../../state/app-state";

import { Content } from "./more/content";
import { Overview } from "./more/overview";

const renderScene = SceneMap({
  overview: Overview,
  content: Content,
});

export const BookChapterModal = () => {
  const { height, width } = useWindowDimensions();
  const [epubReaderOverviewModal, setEpubReaderOverviewModal] = useAtom(
    epubReaderOverviewModalAtom
  );

  const { color, bgPress } = useIconTheme();

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
      <View
        pos={"absolute"}
        right={-100}
        top={-30}
        height={70}
        width={200}
        transform={"rotate(45deg)"}
        backgroundColor={"$backgroundPress"}
        zi={99999}
      >
        <View
          left={85}
          pos={"absolute"}
          transform={"rotate(45deg)"}
          bottom={0}
          zIndex={99999}
          onPress={() => setEpubReaderOverviewModal(false)}
        >
          <X />
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width, height }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: bgPress,
            }}
            indicatorStyle={{ backgroundColor: color }}
          />
        )}
      />
    </Modal>
  );
};
