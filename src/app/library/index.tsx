/* eslint-disable react/prop-types */
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  NavigationState,
  SceneRendererProps,
  TabView,
} from "react-native-tab-view";
import { Home, Library } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { Button, Text, ToggleGroup } from "tamagui";

import LibraryPage from "../../components/tab-pages/library-page";
import PersonalizedPage from "../../components/tab-pages/personalized-page";
import { TabContainer, TabGroup } from "../../components/tabs";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";

const tabs = [
  { label: "Home", icon: Home },
  { label: "Library", icon: Library },
];

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

  const renderTabBar = (
    props: SceneRendererProps & {
      navigationState: NavigationState<{ key: string; title: string }>;
    }
  ) => {
    const index = props.navigationState.index;
    const key = props.navigationState.routes[props.navigationState.index].key;

    return (
      <TabContainer>
        <TabGroup theme="blue" type="single" value={key}>
          {tabs.map((tab, i) => (
            <ToggleGroup.Item
              key={i}
              opacity={index === i ? 1 : 0.75}
              onPress={() => {
                setIndex(i);
              }}
              value="home"
              flex={1}
            >
              <tab.icon color={index === i ? "$blue10" : null} />
              <Text>{tab.label}</Text>
            </ToggleGroup.Item>
          ))}
        </TabGroup>
      </TabContainer>
    );
  };

  // maybe render on each tab view?
  return (
    <>
      {!user ? (
        <Button onPress={() => router.push("/server-connect/")}>Connect</Button>
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      )}
    </>
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
