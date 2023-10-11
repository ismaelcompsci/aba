import { Backpack, Home, Library, Ungroup, User } from "@tamagui/lucide-icons";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { ToggleGroup, XStack } from "tamagui";

type SectionHeader = "home" | "library" | "series" | "collections" | "authors";

/* make toplevel component in layout file */
const SectionHeader = () => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<SectionHeader>();

  useEffect(() => {
    if (pathname === "/home") setActiveItem("home");
    if (pathname === "/library") setActiveItem("library");
    if (pathname === "/series") setActiveItem("series");
  }, [pathname]);

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
        value={activeItem}
      >
        <ToggleGroup.Item
          value="home"
          onPress={() => {
            router.push("/home/");
          }}
          flex={1}
        >
          <Home />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          onPress={() => {
            router.push("/library/");
          }}
          value="library"
          flex={1}
        >
          <Library />
        </ToggleGroup.Item>
        <ToggleGroup.Item
          flex={1}
          value="series"
          onPress={() => {
            router.push("/series/");
          }}
        >
          <Backpack />
        </ToggleGroup.Item>
        <ToggleGroup.Item flex={1} value="collections">
          <Ungroup />
        </ToggleGroup.Item>
        <ToggleGroup.Item flex={1} value="authors">
          <User />
        </ToggleGroup.Item>
      </ToggleGroup>
    </XStack>
  );
};

export default SectionHeader;
