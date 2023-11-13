import { useState } from "react";
import { Modal, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { X } from "@tamagui/lucide-icons";
import { useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { ScrollView, Separator, Text, View, XStack, YStack } from "tamagui";

import useIconTheme from "../../../hooks/use-icon-theme";
import { epubReaderOverviewModalAtom } from "../../../state/app-state";
import { bookAnnotationsAtom } from "../../../state/local-state";
import { FullScreen, ScreenCenter } from "../../center";

import { Content } from "./tab-views/content";
import { Overview } from "./tab-views/overview";

const Annotations = () => {
  const { id } = useLocalSearchParams();
  const bookAnnotations = useAtomValue(bookAnnotationsAtom);
  const annotations = bookAnnotations[Array.isArray(id) ? id[0] : id];

  return (
    <FullScreen padding={"$4"}>
      {annotations?.length ? (
        <ScrollView space height={"100%"} bg="red">
          {annotations?.map((ann) => {
            const date = new Date(ann.created);
            return (
              <YStack key={ann.value}>
                <Text>
                  {ann.color === "strikethrough" ? (
                    <Text
                      textDecorationLine="line-through"
                      textDecorationColor="yellow"
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                  {ann.color === "yellow" ? (
                    <Text
                      key={ann.value}
                      backgroundColor={"rgba(255, 255, 0, 0.4)"}
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                  {ann.color === "underline" ? (
                    <Text
                      textDecorationLine="underline"
                      textDecorationColor={"yellow"}
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                  {ann.color === "squiggly" ? (
                    <Text
                      textDecorationLine="underline"
                      textDecorationColor={"yellow"}
                      textDecorationStyle="dotted"
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                </Text>

                <XStack pt={"$4"} pb={"$2"}>
                  <Text color={"$gray11"} fontSize={"$1"}>
                    {date.toLocaleString()}
                  </Text>
                </XStack>
                <Separator />
              </YStack>
            );
          })}
        </ScrollView>
      ) : (
        <ScreenCenter>
          <Text>empty :/</Text>
        </ScreenCenter>
      )}
    </FullScreen>
  );
};

const renderScene = SceneMap({
  overview: Overview,
  content: Content,
  annotations: Annotations,
});

export const BookChapterModal = () => {
  const { height, width } = useWindowDimensions();
  const [epubReaderOverviewModal, setEpubReaderOverviewModal] = useAtom(
    epubReaderOverviewModalAtom
  );

  const { color, bgStrong, bg } = useIconTheme();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "overview", title: "overview" },
    { key: "content", title: "Content" },
    { key: "annotations", title: "Annotations" },
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
              backgroundColor: bg,
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
