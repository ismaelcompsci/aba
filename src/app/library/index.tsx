/* eslint-disable react/prop-types */
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  SceneRendererProps,
  TabBar,
  TabBarIndicator,
  TabView,
} from "react-native-tab-view";
import { Home, Library } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Text, useTheme, XStack, YStack } from "tamagui";

import NoServer from "../../components/no-server";
import { SortSelect } from "../../components/sort-popover";
import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import useIconTheme from "../../hooks/use-icon-theme";
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

  const { iconColor, themeColor } = useIconTheme();

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
        <YStack h="100%" w="100%">
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={(props) => (
              <YStack>
                <TabBar
                  {...props}
                  style={{ backgroundColor: bg }}
                  indicatorStyle={{ backgroundColor: color }}
                  renderIndicator={(props) => (
                    <TabBarIndicator
                      {...props}
                      style={{
                        backgroundColor: themeColor?.val
                          ? themeColor.val
                          : themeColor,
                      }}
                    />
                  )}
                  tabStyle={{ flex: 1 }}
                  renderLabel={({ route, focused }) => {
                    const Icon = tabs[route.title as TabName];
                    return (
                      <XStack
                        gap="$2"
                        alignItems="center"
                        opacity={!focused ? 0.5 : 1}
                      >
                        <Icon color={iconColor} />
                        <Text>{route.title}</Text>
                      </XStack>
                    );
                  }}
                />
                {/* {routes[index].key === "_libraryPage" ? (
                  <XStack
                    w={"100%"}
                    justifyContent="flex-end"
                    alignItems="center"
                    px="$2"
                  >
                    <SortSelect placement="bottom-end" />
                  </XStack>
                ) : null} */}
              </YStack>
            )}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
          />
        </YStack>
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
