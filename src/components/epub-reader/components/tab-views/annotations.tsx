import { ArrowUp, Trash2 } from "@tamagui/lucide-icons";
import { useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button, ScrollView, Separator, Text } from "tamagui";

import { useAppSafeAreas } from "../../../../hooks/use-app-safe-areas";
import { userAtom } from "../../../../state/app-state";
import { epubReaderOverviewModalAtom } from "../../../../state/epub-reader-state";
import { bookAnnotationsAtom } from "../../../../state/local-state";
import { cleanString } from "../../../../utils/utils";
import { Flex } from "../../../layout/flex";
import { Screen } from "../../../layout/screen";
import { useReader } from "../../rn-epub-reader";

const Annotations = () => {
  const user = useAtomValue(userAtom);
  const { goToLocation, useMenuAction } = useReader();
  const { id } = useLocalSearchParams();
  const [bookAnnotations, setBookAnnotations] = useAtom(bookAnnotationsAtom);
  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);

  const annotationKey = `${id}-${user?.id}`;
  const annotations = bookAnnotations[annotationKey];

  const { headerHeight } = useAppSafeAreas();

  const handleAnnotationPress = (value: string) => {
    goToLocation(value);
    setEpubReaderOverviewModal(false);
  };

  const deleteAnnotation = (value: string) => {
    setBookAnnotations((prev) => {
      const newAnnotations = { ...prev };
      const filteredAnnotations = newAnnotations[annotationKey]?.filter(
        (anns) => anns.value !== value
      );

      if (filteredAnnotations && newAnnotations[annotationKey]?.length >= 0) {
        newAnnotations[annotationKey] = filteredAnnotations;
      } else {
        newAnnotations[annotationKey] = [];
      }

      return newAnnotations;
    });

    useMenuAction({ action: "delete", value });
  };

  return (
    <Screen
      padding={"$4"}
      centered
      pb={!annotations?.length ? headerHeight : undefined}
    >
      {annotations?.length ? (
        <ScrollView
          space
          height={"100%"}
          width={"100%"}
          showsVerticalScrollIndicator={false}
        >
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
                      {cleanString(ann.text, 350)}
                    </Text>
                  ) : null}
                  {ann.color === "yellow" || ann.color === "highlight" ? (
                    <Text
                      key={ann.value}
                      backgroundColor={"rgba(255, 255, 0, 0.4)"}
                    >
                      {cleanString(ann.text, 350)}
                    </Text>
                  ) : null}
                  {ann.color === "underline" ? (
                    <Text
                      textDecorationLine="underline"
                      textDecorationColor={"yellow"}
                    >
                      {cleanString(ann.text, 350)}
                    </Text>
                  ) : null}
                  {ann.color === "squiggly" ? (
                    <Text
                      textDecorationLine="underline"
                      textDecorationColor={"yellow"}
                      textDecorationStyle="dotted"
                    >
                      {cleanString(ann.text, 350)}
                    </Text>
                  ) : null}
                </Text>

                <Flex row pt={"$4"} pb={"$2"} ai="center" jc="space-between">
                  <Text color={"$gray11"} fontSize={"$1"}>
                    {date.toLocaleString()}
                  </Text>
                  <Flex row space="$4">
                    <Button
                      circular
                      size={"$1.5"}
                      icon={ArrowUp}
                      onPress={() => handleAnnotationPress(ann.value)}
                    />
                    <Button
                      circular
                      size={"$1.5"}
                      icon={Trash2}
                      theme={"red"}
                      onPress={() => deleteAnnotation(ann.value)}
                    />
                  </Flex>
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
