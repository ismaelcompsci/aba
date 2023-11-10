import { memo, useEffect, useState } from "react";
import { FlatList, Modal, StatusBar, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { X } from "@tamagui/lucide-icons";
import axios from "axios";
import * as Burnt from "burnt";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Image, Separator, Text, View, XStack, YStack } from "tamagui";

import useIconTheme from "../../hooks/use-icon-theme";
import {
  epubReaderLoadingAtom,
  epubReaderTocAtom,
} from "../../state/app-state";
import { ebookSettignsAtom } from "../../state/local-state";
import { LibraryItemExpanded, User } from "../../types/aba";
import { awaitTimeout } from "../../utils/utils";
import { FullScreen } from "../center";

import Menu from "./components/menu";
import ScrollLabels from "./components/scroll-labels";
import {
  LocationChange,
  Reader,
  ReaderBook,
  TocItem,
  useReader,
} from "./rn-epub-reader";

interface EBookReaderProps {
  book: LibraryItemExpanded;
  user: User;
  serverAddress: string;
  bookPath: string;
  initialLocation: string | undefined;
}

const EBookReader = ({
  book,
  user,
  serverAddress,
  bookPath,
  initialLocation,
}: EBookReaderProps) => {
  const { width, height } = useWindowDimensions();

  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);
  const setEpubReaderLoading = useSetAtom(epubReaderLoadingAtom);
  const setEpubReaderToc = useSetAtom(epubReaderTocAtom);
  const ebookSettings = useAtomValue(ebookSettignsAtom);
  const [hide, setHide] = useState(false);
  const [_, setReady] = useState(false);
  const [showingNext, setShowingNext] = useState(false);
  const [showingPrev, setShowingPrev] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const { setIsPdf } = useReader();

  const isPdf = bookPath.endsWith(".pdf");
  const enableSwipe = isPdf;

  const onReady = async (book: ReaderBook) => {
    setEpubReaderToc(book.toc);
    await awaitTimeout(100);
    setReady(true);
    setEpubReaderLoading({ loading: false, part: "Opening Book..." });
  };

  const onShowPrevious = (show: boolean, label: string) => {
    setCurrentLabel((prev) => (label ? label : prev));
    setShowingPrev(show);
  };

  const onShowNext = (show: boolean, label: string) => {
    setCurrentLabel((prev) => (label ? label : prev));
    setShowingNext(show);
  };

  const onPress = () => {
    setHide((p) => !p);
  };

  const onDisplayError = (reason: string) => {
    Burnt.toast({
      preset: "error",
      title: reason,
    });
    setEpubReaderLoading({ loading: false });
  };

  const onLocationChange = ({ cfi, fraction, section }: LocationChange) => {
    let payload;
    if (!isPdf) {
      payload = {
        ebookLocation: cfi,
        ebookProgress: fraction,
      };
    } else {
      payload = {
        ebookLocation: section.current,
        ebookProgress: fraction,
      };
    }
    console.log("ON LOCATION CHANGE");
    updateProgress(payload);
  };

  const updateProgress = async (payload: {
    ebookLocation: string;
    ebookProgress: number;
  }) => {
    try {
      if (!payload.ebookLocation && !payload.ebookProgress) return;

      axios.patch(`${serverAddress}/api/me/progress/${book.id}`, payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    } catch (error) {
      console.log("[EBOOKREADER] Update progress error", error);
    }
  };

  useEffect(() => {
    StatusBar.setHidden(!hide);
    return () => StatusBar.setHidden(false);
  }, [hide]);

  useEffect(() => {
    setIsPdf(bookPath.endsWith(".pdf"));
  }, [bookPath]);

  return (
    <>
      <Menu
        hide={hide}
        title={book.media.metadata.title || ""}
        setEpubReaderOverviewModal={setEpubReaderOverviewModal}
      >
        <FullScreen pos="absolute" t={0} b={0} r={0} l={0}>
          <ScrollLabels
            showingNext={showingNext}
            showingPrev={showingPrev}
            label={currentLabel}
            readerSettings={ebookSettings}
            menuHidden={hide}
          />
          <Reader
            height={height}
            width={width}
            src={bookPath}
            enableSwipe={enableSwipe}
            defaultTheme={ebookSettings}
            fileSystem={useFileSystem}
            onPress={onPress}
            initialLocation={initialLocation}
            onShowNext={onShowNext}
            onShowPrevious={onShowPrevious}
            onLocationChange={onLocationChange}
            onStarted={() =>
              setEpubReaderLoading({ loading: true, part: "Opening Book..." })
            }
            onReady={onReady}
            onDisplayError={onDisplayError}
          />
        </FullScreen>
      </Menu>
      <BookChapterModal />
    </>
  );
};

const epubReaderOverviewModalAtom = atom(false);
const BookChapterModal = () => {
  const { height, width } = useWindowDimensions();
  const [epubReaderOverviewModal, setEpubReaderOverviewModal] = useAtom(
    epubReaderOverviewModalAtom
  );

  const { bg, color } = useIconTheme();

  const [index, setIndex] = useState(1);
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
              backgroundColor: bg,
            }}
            indicatorStyle={{ backgroundColor: color }}
          />
        )}
      />
    </Modal>
  );
};

const Overview = () => {
  const { cover } = useReader();
  console.log(cover);

  return (
    <YStack flex={1} bg="$background">
      {cover ? (
        <Image
          resizeMode="contain"
          source={{
            uri: `data:image/png;base64,${cover}`,
            width: 200,
            height: 200,
          }}
        />
      ) : null}
    </YStack>
  );
};

const Content = () => {
  const { currentLocation, goToLocation } = useReader();
  const epubReaderToc = useAtomValue(epubReaderTocAtom);

  const handleTocItemPress = (item: TocItem) => {
    goToLocation(item.href);
  };

  const TocItemView = ({ item }: { item: TocItem }) => {
    return (
      <YStack>
        <XStack
          h="$3"
          ai="center"
          pressStyle={{
            bg: "$backgroundPress",
          }}
          paddingHorizontal={"$2"}
          onPress={() => handleTocItemPress(item)}
          bg={
            currentLocation?.tocItem?.id === item.id
              ? "$backgroundPress"
              : "$background"
          }
        >
          <Text>{item.label}</Text>
        </XStack>
        <Separator borderRadius={"$4"} />

        {item.subitems && item.subitems.length > 0 ? (
          <YStack pl={"$4"}>
            {item.subitems.map((subitem: TocItem) => (
              <TocItemView key={subitem.id} item={subitem} />
            ))}
          </YStack>
        ) : null}
      </YStack>
    );
  };

  return (
    <YStack flex={1} bg="$background" padding={"$4"}>
      <FlatList
        data={epubReaderToc}
        keyExtractor={(item, i) => `${item.id || 0}-${i}`}
        ItemSeparatorComponent={() => <Separator borderRadius={"$4"} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <TocItemView item={item} />}
      />
    </YStack>
  );
};

const renderScene = SceneMap({
  overview: Overview,
  content: Content,
});

export default memo(EBookReader);
