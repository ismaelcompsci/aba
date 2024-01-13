import { Alert } from "react-native";
import Popover from "react-native-popover-view";
import { Mode, Placement, Point } from "react-native-popover-view/dist/Types";
import { IconProps } from "@tamagui/helpers-icon";
import {
  Activity,
  Copy,
  Highlighter,
  Strikethrough,
  Trash2,
  Underline,
} from "@tamagui/lucide-icons";
import { atom, useAtom } from "jotai";
import { Separator, useTheme } from "tamagui";

import { Flex } from "../../layout/flex";
import { TouchableArea } from "../../touchable/touchable-area";
import { useReader } from "../rn-epub-reader";

type ReaderPopoverMenu = {
  open: boolean;

  x?: number;
  y?: number;
  isNew?: boolean;
};

export const readerPopoverMenuAtom = atom<ReaderPopoverMenu>({ open: false });

export const ReaderPopoverMenu = () => {
  const [readerPopoverMenu, setReaderPopovermenu] = useAtom(
    readerPopoverMenuAtom
  );

  const { useMenuAction } = useReader();

  const colors = useTheme();

  const menuItems = [
    "copy",
    "highlight",
    "strikethrough",
    "squiggly",
    "underline",
  ];

  if (!readerPopoverMenu.isNew) {
    menuItems.push("delete");
  }

  const iconMaps: { [key: string]: React.NamedExoticComponent<IconProps> } = {
    copy: Copy,
    highlight: Highlighter,
    strikethrough: Strikethrough,
    underline: Underline,
    squiggly: Activity,
    delete: Trash2,
  };

  const onCustomMenuSelection = (key: string) => {
    switch (key) {
      case "copy":
        useMenuAction({ action: "copy" });
        break;
      case "highlight":
        useMenuAction({ action: "highlight", color: "yellow" });
        break;
      case "strikethrough":
        useMenuAction({ action: "strikethrough", color: "strikethrough" });
        break;
      case "squiggly":
        useMenuAction({ action: "squiggly", color: "squiggly" });
        break;
      case "underline":
        useMenuAction({ action: "underline", color: "underline" });
        break;
      case "delete":
        Alert.alert(
          "Delete annotation",
          "Are you sure you want to delete this annotation",

          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Okay",
              style: "destructive",
              onPress: () => {
                useMenuAction({ action: "delete" });
              },
            },
          ],
          {
            cancelable: true,
          }
        );

        break;
      case "speak_from_here":
        useMenuAction({ action: "speak_from_here" });
        break;
      default:
        break;
    }
    setReaderPopovermenu({ open: false });
  };

  if (readerPopoverMenu.x && readerPopoverMenu.y)
    return (
      <Popover
        from={new Point(readerPopoverMenu.x, readerPopoverMenu.y)}
        mode={Mode.RN_MODAL}
        placement={Placement.AUTO}
        offset={2}
        isVisible={readerPopoverMenu.open}
        onRequestClose={() => {
          // @ts-ignore
          useMenuAction({ action: "" });
          setReaderPopovermenu({ open: false });
        }}
        backgroundStyle={{
          backgroundColor: "black",
          opacity: 0.1,
        }}
        popoverStyle={{
          borderRadius: 12,
          backgroundColor: colors.background.get(),
        }}
      >
        <Flex px="$4" py="$3" row>
          {menuItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === menuItems.length - 1;
            const Icon: React.NamedExoticComponent<IconProps> = iconMaps[item];

            return (
              <Flex key={item} row pl={isFirst ? "$0" : "$2.5"}>
                <TouchableArea
                  key={item}
                  onPress={() => onCustomMenuSelection(item)}
                  hitSlop={12}
                >
                  <Icon
                    size={22}
                    color={
                      item === "delete"
                        ? "$red10"
                        : item === "copy"
                        ? "$color"
                        : "$yellow10"
                    }
                  />
                </TouchableArea>
                {!isLast ? <Separator vertical pl="$2.5" /> : null}
              </Flex>
            );
          })}
        </Flex>
      </Popover>
    );
  else {
    return null;
  }
};
