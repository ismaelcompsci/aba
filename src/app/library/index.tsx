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
  BookCopy,
  HardDrive,
  Home,
  Library,
  Search,
  User,
} from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { Button, Spinner, Text, useTheme } from "tamagui";

import { AnimatedFlex, Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import NoServer from "../../components/no-server";
import AddPage from "../../components/tab-pages/add-page";
import AuthorsPage from "../../components/tab-pages/authors-page";
import CollectionsPage from "../../components/tab-pages/collections-page";
import LatestPage from "../../components/tab-pages/latest-page";
import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import PlaylistsPage from "../../components/tab-pages/playlists-page";
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

const tabs: Tabs<IconProps> = {
  Home: Home,
  Library: Library,
  Series: Backpack,
  Latest: Activity,
  Add: Search,
  Playlists: HardDrive,
  Collections: BookCopy,
  Authors: User,
};

type TabPage = {
  key: string;
  title: string;
};

const HomePage = () => {
  const userToken = useAtomValue(userTokenAtom);
  const isAdminOrUp = useAtomValue(isAdminOrUpAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const changingLibrary = useAtomValue(changingLibraryAtom);
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const currentLibraryMediaType = useAtomValue(currentLibraryMediaTypeAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  const [userHasPlaylists, setUserHasPlaylists] = useState(false);

  useQuery({
    queryKey: ["has-playlists", currentLibraryId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${serverAddress}/api/libraries/${currentLibraryId}`,
          {
            params: {
              include: "filterdata",
            },
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        const { numUserPlaylists } = response.data;

        const userHasPlaylists = Boolean(numUserPlaylists);

        setUserHasPlaylists(userHasPlaylists);
        return userHasPlaylists;
      } catch (error) {
        console.log("[HOMEPAGE] userPlaylists error ", error);
      }
    },
  });

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
        { key: "_collectionsPage", title: "Collections" },
        { key: "_authorsPage", title: "Authors" },
      ];
    }

    if (userHasPlaylists) {
      tabs.push({
        key: "_playlistsPage",
        title: "Playlists",
      });
    }

    setRoutes(tabs);
  }, [
    currentLibraryMediaType,
    currentLibraryId,
    changingLibrary,
    userHasPlaylists,
  ]);

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState<TabPage[] | null>(null);

  const colors = useTheme();
  const color = colors.color.get();

  if (!userToken) {
    return router.push("/server-connect/");
  }

  useEffect(() => {
    setIndex(0);
  }, [currentLibraryId]);

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
      case "_playlistsPage":
        return (
          <PlaylistsPage
            currentLibraryId={currentLibraryId}
            serverAddress={serverAddress}
            userToken={userToken}
          />
        );
      case "_collectionsPage":
        return (
          <CollectionsPage
            currentLibraryId={currentLibraryId}
            serverAddress={serverAddress}
            userToken={userToken}
          />
        );
      case "_authorsPage":
        return (
          <AuthorsPage
            currentLibraryId={currentLibraryId}
            serverAddress={serverAddress}
            userToken={userToken}
          />
        );
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
              <Text numberOfLines={1}>{scene.route.title}</Text>
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
          <Button>
            <Spinner />
          </Button>
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
