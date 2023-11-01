/* eslint-disable react/prop-types */
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  SceneRendererProps,
  TabBar,
  TabBarIndicator,
  TabView,
} from "react-native-tab-view";
import { Backpack, Home, Library } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Text, useTheme, XStack, YStack } from "tamagui";

import { FullScreen } from "../../components/center";
import NoServer from "../../components/no-server";
import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import SeriesPage from "../../components/tab-pages/series-page";
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
  Series: Backpack,
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
    { key: "_seriesPage", title: "Series" },
  ]);

  const { iconColor } = useIconTheme();

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
      case "_seriesPage":
        return (
          <SeriesPage
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
  // [serverConfig?.id, currentLibraryId, library?.id, user?.id]
  // );

  return (
    <FullScreen>
      {!user ? (
        <NoServer />
      ) : (
        <FullScreen>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={(props) => {
              return (
                <TabBar
                  {...props}
                  style={{
                    backgroundColor: bg,
                  }}
                  indicatorStyle={{ backgroundColor: color }}
                  // renderLabel={({ route, focused }) => {
                  //   return (
                  //     // <XStack alignItems="center" opacity={!focused ? 0.5 : 1}>
                  //     <Text>{route.title}</Text>
                  //     // </XStack>
                  //   );
                  // }}
                  // renderTabBarItem={}
                  renderIcon={({ route, focused }) => {
                    const Icon = tabs[route.title as TabName];
                    return (
                      <Icon
                        size={"$1"}
                        opacity={!focused ? 0.5 : 1}
                        color={iconColor}
                      />
                    );
                  }}
                />
              );
            }}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
          />
        </FullScreen>
      )}
    </FullScreen>
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
