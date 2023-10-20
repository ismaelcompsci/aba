/* eslint-disable react/prop-types */
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { SceneRendererProps, TabBar, TabView } from "react-native-tab-view";
import { Home, Library } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Text, useTheme, XStack, YStack } from "tamagui";

import NoServer from "../../components/no-server";
import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { TabName, Tabs } from "../../types/types";

const tabs: Tabs = {
  Home: Home,
  Library: Library,
};

const HomePage = () => {
  const [user] = useAtom(userAtom);
  const [currentLibraryId] = useAtom(currentLibraryIdAtom);
  const [serverConfig] = useAtom(currentServerConfigAtom);
  const [library] = useAtom(currentLibraryAtom);

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "_personalPage", title: "Home" },
    { key: "_libraryPage", title: "Library" },
  ]);

  const theme = useTheme();
  const bg = theme.background.get();
  const color = theme.color.get();

  const renderScene = ({
    route,
  }: SceneRendererProps & {
    route: {
      key: string;
      title: string;
    };
  }) => {
    switch (route.key) {
      case "_personalPage":
        return (
          <PersonalizedPage
            currentLibraryId={currentLibraryId}
            serverConfig={serverConfig}
            library={library}
            user={user}
          />
        );
      case "_libraryPage":
        return (
          <LibraryPage
            currentLibraryId={currentLibraryId}
            serverConfig={serverConfig}
            library={library}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  return (
    <YStack h="100%" bg="$background">
      {!user ? (
        <NoServer />
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              style={{ backgroundColor: bg }}
              indicatorStyle={{ backgroundColor: color }}
              renderLabel={({ route, focused }) => {
                const Icon = tabs[route.title as TabName];
                return (
                  <XStack
                    gap="$2"
                    alignItems="center"
                    opacity={!focused ? 0.5 : 1}
                  >
                    <Icon />
                    <Text>{route.title}</Text>
                  </XStack>
                );
              }}
            />
          )}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      )}
    </YStack>
  );
};

export default HomePage;

{
  /* <ToggleGroup.Item
  opacity={index === 2 ? 1 : 0.75}
  onPress={() => {
    setIndex(2);
  }}
  flex={1}
  value="series"
>
  <Backpack color={index === 2 ? "$blue10" : null} />
  <Text>Series</Text>
</ToggleGroup.Item> */
}
