import { useEffect, useState } from "react";
import React from "react";
import { useWindowDimensions } from "react-native";
import { ZoomIn } from "react-native-reanimated";
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabView,
} from "react-native-tab-view";
import type { IconProps } from "@tamagui/helpers-icon";
import {
  Activity,
  Backpack,
  Home,
  Library,
  Search,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { Spinner, Text, useTheme } from "tamagui";

import { AnimatedFlex, Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import NoServer from "../../components/no-server";
import LatestPage from "../../components/tab-pages/latest-page";
import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import SeriesPage from "../../components/tab-pages/series-page";
import {
  changingLibraryAtom,
  currentLibraryIdAtom,
  currentLibraryMediaTypeAtom,
  isAdminOrUpAtom,
  isCoverSquareAspectRatioAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { TabName, Tabs } from "../../types/types";
import AddPage from "../../components/tab-pages/add-page";

const tabs: Tabs<IconProps> = {
  Home: Home,
  Library: Library,
  Series: Backpack,
  Latest: Activity,
  Add: Search,
};

type TabPage = {
  key: string;
  title: string;
};

const HomePage = () => {
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const changingLibrary = useAtomValue(changingLibraryAtom);
  const currentLibraryMediaType = useAtomValue(currentLibraryMediaTypeAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);
  const isAdminOrUp = useAtomValue(isAdminOrUpAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  useEffect(() => {
    let tabs = [];

    if (currentLibraryMediaType === "podcast") {
      tabs = [
        { key: "_personalPage", title: "Home" },
        { key: "_latestPage", title: "Latest" },
        { key: "_libraryPage", title: "Library" },
      ];

      if (isAdminOrUp) {
        tabs.push({ key: "_addPage", title: "Add" });
      }
    } else {
      tabs = [
        { key: "_personalPage", title: "Home" },
        { key: "_libraryPage", title: "Library" },
        { key: "_seriesPage", title: "Series" },
      ];
    }

    setRoutes(tabs);
  }, [currentLibraryMediaType, currentLibraryId, changingLibrary]);

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<TabPage[] | null>(null);

  const colors = useTheme();
  const color = colors.color.get();

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
            serverAddress={serverAddress}
            userToken={userToken}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
          />
        );
      case "_libraryPage":
        return (
          <LibraryPage
            currentLibraryId={currentLibraryId}
            serverAddress={serverAddress}
            userToken={userToken}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
          />
        );
      case "_seriesPage":
        return (
          <SeriesPage
            currentLibraryId={currentLibraryId}
            serverAddress={serverAddress}
            userToken={userToken}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
          />
        );
      case "_latestPage":
        return (
          <LatestPage
            currentLibraryId={currentLibraryId}
            serverAddress={serverAddress}
            userToken={userToken}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
          />
        );
      case "_addPage":
        return <AddPage serverAddress={serverAddress} userToken={userToken} />;
      default:
        return null;
    }
  };

  const renderLazyPlaceHolder = (route: {
    route: {
      key: string;
      title: string;
    };
  }) => {
    const props = {
      header:
        route.route.key === "_personalPage" ||
        route.route.key === "_seriesPage",
      headerAndTabBar: route.route.key === "_libraryPage",
    };
    return (
      <Screen centered {...props}>
        <Spinner />
      </Screen>
    );
  };

  const CustomTabBar = (
    props: SceneRendererProps & {
      navigationState: NavigationState<{ key: string; title: string }>;
    }
  ) => {
    return (
      <TabBar
        style={{
          backgroundColor: colors.background.get(),
        }}
        indicatorStyle={{ backgroundColor: color }}
        renderIcon={({ route, focused }) => {
          const currentRoute = routes?.[index];
          if (currentRoute && currentRoute.key === route.key) {
            return null;
          }

          const Icon = tabs[route.title as TabName];
          return (
            <AnimatedFlex entering={ZoomIn}>
              <Icon size={"$1"} opacity={!focused ? 0.5 : 1} color={color} />
            </AnimatedFlex>
          );
        }}
        labelStyle={{ color: color }}
        renderLabel={(scene) => {
          const currentRoute = routes?.[index];

          if (scene.route.key !== currentRoute?.key) return null;
          return (
            <AnimatedFlex entering={ZoomIn}>
              <Text>{scene.route.title}</Text>
            </AnimatedFlex>
          );
        }}
        {...props}
      />
    );
  };

  return (
    <Screen>
      {!userToken || !routes ? (
        <NoServer />
      ) : changingLibrary ? (
        <Flex fill centered pb={44}>
          <Spinner />
        </Flex>
      ) : (
        <TabView
          lazy
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={CustomTabBar}
          renderLazyPlaceholder={renderLazyPlaceHolder}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width, height: layout.height }}
          style={{ width: layout.width, height: layout.height }}
        />
      )}
    </Screen>
  );
};

export default HomePage;
