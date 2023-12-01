import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabView,
} from "react-native-tab-view";
import {
  Activity,
  Backpack,
  Home,
  Library,
  Search,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { Spinner, useTheme } from "tamagui";

import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import NoServer from "../../components/no-server";
import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import SeriesPage from "../../components/tab-pages/series-page";
import {
  currentLibraryIdAtom,
  currentLibraryMediaTypeAtom,
  isAdminOrUpAtom,
  isCoverSquareAspectRatioAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { TabName, Tabs } from "../../types/types";
import LatestPage from "../../components/tab-pages/latest-page";

const tabs: Tabs = {
  Home: Home,
  Library: Library,
  Series: Backpack,
  Latest: Activity,
  Search: Search,
};

type TabPage = {
  key: string;
  title: string;
};

const HomePage = () => {
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
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
        tabs.push({ key: "_searchPage", title: "Search" });
      }
    } else {
      tabs = [
        { key: "_personalPage", title: "Home" },
        { key: "_libraryPage", title: "Library" },
        { key: "_seriesPage", title: "Series" },
      ];
    }

    setRoutes(tabs);
  }, [currentLibraryMediaType, currentLibraryId]);

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
      case "_searchPage":
        return <Flex></Flex>;
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
          backgroundColor: colors.background.get(),
        }}
        indicatorStyle={{ backgroundColor: color }}
        renderIcon={({ route, focused }) => {
          const Icon = tabs[route.title as TabName];
          return (
            <Icon size={"$1"} opacity={!focused ? 0.5 : 1} color={color} />
          );
        }}
        labelStyle={{ color: color }}
        {...props}
      />
    );
  };

  return (
    <Screen>
      {!userToken || !routes ? (
        <NoServer />
      ) : (
        <TabView
          lazy
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          renderLazyPlaceholder={renderLazyPlaceHolder}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width, height: layout.height }}
        />
      )}
    </Screen>
  );
};

export default HomePage;
