import { Modal, TouchableWithoutFeedback } from "react-native";
import {
  Card,
  H2,
  Label,
  ListItem,
  ScrollView,
  Separator,
  XStack,
  YGroup,
  YStack,
  styled,
} from "tamagui";
import { IconButton } from "../ui/button";
import { X } from "@tamagui/lucide-icons";
import { useAtom, useAtomValue } from "jotai/react";
import { librariesAtom, serversModalVisibleAtom } from "../../utils/atoms";
import { currentLibraryIdAtom } from "../../utils/local-atoms";
import { iconMap } from "../../constants/adbs-icons";
import { Library } from "../../types/adbs";
import { useRouter } from "expo-router";

interface ServersModalProps {}

const Touch = styled(TouchableWithoutFeedback);
// TODO better loading state
const ServersModal = ({}: ServersModalProps) => {
  const router = useRouter();

  const libraries = useAtomValue(librariesAtom);
  const [currentLibraryId, setCurrentLibraryId] = useAtom(currentLibraryIdAtom);
  const [visible, setVisible] = useAtom(serversModalVisibleAtom);

  const getIcon = (lib: Library) => {
    const Icon = iconMap[lib.icon];
    return <Icon size={"$1"} color={"$blue10Dark"} />;
  };

  const handleLibraryPress = (id: string) => {
    if (currentLibraryId === id) {
      return hideModal();
    }

    setCurrentLibraryId(id);
    hideModal();
    router.push("/home/");
  };

  const hideModal = () => setVisible(false);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Touch
        onPress={hideModal}
        display="flex"
        justifyContent="center"
        alignContent="center"
        h={"100%"}
        w={"100%"}
      >
        <Card
          onPress={(e) => e.stopPropagation()}
          p={"$2"}
          mx={"$8"}
          bg={"$background"}
          h={"$20"}
          w={"$20"}
        >
          <YStack h={"100%"} w={"100%"} space="$4">
            <XStack justifyContent="flex-end">
              <Label alignSelf="center" mr="auto">
                <H2>Libraries</H2>
              </Label>
              <IconButton
                onPress={hideModal}
                icon={<X size={"$1"} color={"$blue10Dark"} />}
              />
            </XStack>
            <YGroup separator={<Separator />} pb="$9">
              <ScrollView>
                {libraries.map((lib) => {
                  const isActive = lib.id === currentLibraryId;

                  return (
                    <YGroup.Item key={lib.id}>
                      <ListItem
                        onPress={() => {
                          handleLibraryPress(lib.id);
                        }}
                        theme={isActive ? "blue" : "ListItem"}
                        pos={"relative"}
                        display="flex"
                        flexDirection="row"
                        gap={"$2"}
                      >
                        {isActive ? (
                          <YStack
                            pos={"absolute"}
                            left={0}
                            bg={"$blue11"}
                            w={2}
                            h={"100%"}
                          />
                        ) : null}
                        {getIcon(lib)}
                        {lib.name}
                      </ListItem>
                    </YGroup.Item>
                  );
                })}
              </ScrollView>
            </YGroup>
          </YStack>
        </Card>
      </Touch>
    </Modal>
  );
};

export default ServersModal;
