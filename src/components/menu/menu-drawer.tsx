import React, { useEffect, useState } from "react";
import { Animated, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useAtom } from "jotai";
import { Sheet, Text, useTheme, XStack, YStack } from "tamagui";

import { openModalAtom } from "../../state/app-state";

import SettingsTab from "./settings-tab";
import { FullScreen } from "../center";

const ConnectionTab = () => {
  return;
};

const renderScene = SceneMap({
  settings: SettingsTab,
});

const MenuDrawer = () => {
  const [open, setOpen] = useAtom(openModalAtom);
  const theme = useTheme();

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([{ key: "settings", title: "Settings" }]);

  useEffect(() => {
    const av = new Animated.Value(0);
    av.addListener(() => {});
  }, []);

  return (
    <Sheet
      native
      open={open}
      onOpenChange={setOpen}
      dismissOnSnapToBottom
      animation="quick"
      zIndex={100_000}
      modal
    >
      <Sheet.Overlay
        animation="100ms"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame>
        <FullScreen>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                style={{ backgroundColor: theme.background.get() }}
                indicatorStyle={{ backgroundColor: theme.color.get() }}
                renderLabel={({ route, focused }) => {
                  return (
                    <XStack
                      gap="$2"
                      alignItems="center"
                      opacity={!focused ? 0.5 : 1}
                    >
                      <Text>{route.title}</Text>
                    </XStack>
                  );
                }}
              />
            )}
          />
        </FullScreen>
      </Sheet.Frame>
    </Sheet>
  );
};

export default MenuDrawer;
