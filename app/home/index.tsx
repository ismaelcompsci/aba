import { useAtomValue } from "jotai/react";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Spinner,
  Text,
  ToggleGroup,
  XStack,
  YStack,
} from "tamagui";

import { useWindowDimensions } from "react-native";
import {
  NavigationState,
  SceneMap,
  SceneRendererProps,
  TabView,
} from "react-native-tab-view";
import { getPersonalizedLibrary } from "../../api/library";
import BookShelf from "../../components/book/book-shelf";
import { PersonalizedView } from "../../types/server";
import { currentLibraryAtom } from "../../utils/atoms";
import { currentLibraryIdAtom } from "../../utils/local-atoms";
import LibraryPage from "../library";
import SeriesPages from "../series";
import { Backpack, Home as HomeIcon, Library } from "@tamagui/lucide-icons";

const Home = () => {
  const [loading, setLoading] = useState(false);

  const [personalizedLibrary, setPersonalizedLibrary] = useState<
    PersonalizedView[] | null
  >(null);
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const lib = useAtomValue(currentLibraryAtom);

  const isCoverSquareAspectRatio = lib?.settings.coverAspectRatio === 1;

  useEffect(() => {
    const fetchShelfs = async () => {
      setLoading(true);
      const { error, data } = await getPersonalizedLibrary(currentLibraryId);
      if (error) {
        // TODO Better
        console.log("[PERSONALIZED_LIBRARY] ", error);
      }

      setPersonalizedLibrary(data);
      setLoading(false);
    };

    fetchShelfs();
  }, [currentLibraryId]);

  return (
    <YStack h={"100%"} w={"100%"} bg={"$background"} alignContent="center">
      {loading ? (
        <Spinner
          pos={"absolute"}
          t={"50%"}
          left={"50%"}
          style={{
            transform: [{ translateY: -50 }],
          }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          px={"$2"}
          bg={"$background"}
          space={"$4"}
          h={"100%"}
        >
          {personalizedLibrary?.map((library: PersonalizedView, i) => (
            <BookShelf
              isCoverSquareAspectRatio={isCoverSquareAspectRatio}
              key={library.id + i}
              shelf={library}
            />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
};

const renderScene = SceneMap({
  home: Home,
  library: LibraryPage,
  series: SeriesPages,
});

/**
 *
 * https://snack.expo.dev/@satya164/react-native-tab-view-custom-tabbar
 */
const HomePage = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "home", title: "Home" },
    { key: "library", title: "Library" },
    { key: "series", title: "Series" },
  ]);

  const renderTabBar = (
    props: SceneRendererProps & {
      navigationState: NavigationState<{ key: string; title: string }>;
    }
  ) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    const index = props.navigationState.index;
    const key = props.navigationState.routes[props.navigationState.index].key;

    return (
      <XStack
        alignItems="center"
        py={"$2"}
        px={"$3"}
        justifyContent="center"
        w={"100%"}
        bg={"$background"}
      >
        <ToggleGroup
          theme={"blue"}
          size={"$5"}
          w={"100%"}
          h={"$4"}
          orientation="horizontal"
          type="single"
          value={key}
        >
          <ToggleGroup.Item
            opacity={index === 0 ? 1 : 0.75}
            onPress={() => {
              setIndex(0);
            }}
            value="home"
            flex={1}
          >
            {/* @ts-ignore*/}
            <HomeIcon color={index === 0 ? "$blue10" : null} />
            <Text>Home</Text>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            opacity={index === 1 ? 1 : 0.75}
            onPress={() => {
              setIndex(1);
            }}
            value="library"
            flex={1}
          >
            {/* @ts-ignore*/}
            <Library color={index === 1 ? "$blue10" : null} />
            <Text>Library</Text>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            opacity={index === 2 ? 1 : 0.75}
            onPress={() => {
              setIndex(2);
            }}
            flex={1}
            value="series"
          >
            {/* @ts-ignore*/}
            <Backpack color={index === 2 ? "$blue10" : null} />
            <Text>Series</Text>
          </ToggleGroup.Item>
        </ToggleGroup>
      </XStack>
    );
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
};

export default HomePage;
