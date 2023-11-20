import { ArrowUp } from "@tamagui/lucide-icons";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, ScrollView, Separator, Text } from "tamagui";

import { useAppSafeAreas } from "../../../../hooks/use-app-safe-areas";
import { epubReaderOverviewModalAtom } from "../../../../state/app-state";
import { bookAnnotationsAtom } from "../../../../state/local-state";
import { Flex } from "../../../layout/flex";
import { Screen } from "../../../layout/screen";
import { useReader } from "../../rn-epub-reader";

const Annotations = () => {
  const { goToLocation } = useReader();
  const { id } = useLocalSearchParams();
  const bookAnnotations = useAtomValue(bookAnnotationsAtom);
  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);
  const annotations = bookAnnotations[Array.isArray(id) ? id[0] : id];

  const { headerHeight } = useAppSafeAreas();

  const handleAnnotationPress = (value: string) => {
    goToLocation(value);
    setEpubReaderOverviewModal(false);
  };

  return (
    <Screen
      padding={"$4"}
      $platform-android={{
        paddingTop: "$10",
      }}
      centered
      pb={!annotations?.length ? headerHeight : undefined}
    >
      {annotations?.length ? (
        <ScrollView space height={"100%"} showsVerticalScrollIndicator={false}>
          {annotations?.map((ann, index) => {
            const date = new Date(ann.created);
            return (
              <Flex key={`${ann.value}-${index}`}>
                <Text>
                  {ann.color === "strikethrough" ? (
                    <Text
                      textDecorationLine="line-through"
                      textDecorationColor="yellow"
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                  {ann.color === "yellow" ? (
                    <Text
                      key={ann.value}
                      backgroundColor={"rgba(255, 255, 0, 0.4)"}
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                  {ann.color === "underline" ? (
                    <Text
                      textDecorationLine="underline"
                      textDecorationColor={"yellow"}
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                  {ann.color === "squiggly" ? (
                    <Text
                      textDecorationLine="underline"
                      textDecorationColor={"yellow"}
                      textDecorationStyle="dotted"
                    >
                      {ann.text}
                    </Text>
                  ) : null}
                </Text>

                <Flex row pt={"$4"} pb={"$2"} ai="center" jc="space-between">
                  <Text color={"$gray11"} fontSize={"$1"}>
                    {date.toLocaleString()}
                  </Text>
                  <Button
                    circular
                    size={"$1.5"}
                    icon={ArrowUp}
                    onPress={() => handleAnnotationPress(ann.value)}
                  />
                </Flex>
                <Separator />
              </Flex>
            );
          })}
        </ScrollView>
      ) : (
        <Text>empty :/</Text>
      )}
    </Screen>
  );
};
export default Annotations;
