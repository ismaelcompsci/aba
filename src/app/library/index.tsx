/* eslint-disable react/prop-types */
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabView,
} from "react-native-tab-view";
import { Backpack, Home, Library } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Text, useTheme, View } from "tamagui";

import { FullScreen } from "../../components/center";
import NoServer from "../../components/no-server";
import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import SeriesPage from "../../components/tab-pages/series-page";
import useIconTheme from "../../hooks/use-icon-theme";
import {
  currentLibraryIdAtom,
  isCoverSquareAspectRatioAtom,
  userAtom,
  userTokenAtom,
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
  const userToken = useAtomValue(userTokenAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

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

  if (!userToken) {
    return router.push("/server-connect/");
  }

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
            userToken={userToken}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
          />
        );
      case "_libraryPage":
        return (
          <LibraryPage
            currentLibraryId={currentLibraryId}
            serverConfig={serverConfig}
            userToken={userToken}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
          />
        );
      case "_seriesPage":
        return (
          <SeriesPage
            currentLibraryId={currentLibraryId}
            serverConfig={serverConfig}
            userToken={userToken}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
          />
        );
      default:
        return null;
    }
  };

  const renderLazyPlaceHolder = (props: {
    route: {
      key: string;
      title: string;
    };
  }) => {
    return (
      <View flex={1} jc="center" ai="center">
        <Text>Loading {props.route.title}</Text>
      </View>
    );
  };

  const renderTabBar = (
    props: SceneRendererProps & {
      navigationState: NavigationState<{
        key: string;
        title: string;
      }>;
    }
  ) => {
    return (
      <TabBar
        style={{
          backgroundColor: bg,
        }}
        indicatorStyle={{ backgroundColor: color }}
        renderIcon={({ route, focused }) => {
          const Icon = tabs[route.title as TabName];
          return (
            <Icon size={"$1"} opacity={!focused ? 0.5 : 1} color={iconColor} />
          );
        }}
        labelStyle={{ color: color }}
        {...props}
      />
    );
  };

  return (
    <FullScreen>
      {!user ? (
        <NoServer />
      ) : (
        <FullScreen>
          <TabView
            lazy
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            renderLazyPlaceholder={renderLazyPlaceHolder}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width, height: layout.height }}
          />
        </FullScreen>
      )}
    </FullScreen>
  );
};

export default HomePage;
