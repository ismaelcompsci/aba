import { useAtomValue } from "jotai/react";
import { useEffect, useState } from "react";
import { ScrollView, Spinner, YStack, Text } from "tamagui";

import { currentLibraryIdAtom } from "../../utils/local-atoms";
import { getPersonalizedLibrary } from "../../api/library";
import { PersonalizedView } from "../../types/server";
import BookShelf from "../../components/book/book-shelf";
import { currentLibraryAtom } from "../../utils/atoms";
import SectionHeader from "../../components/section-header";

const HomePage = () => {
  const [loading, setLoading] = useState(false);

  const [personalizedLibrary, setPersonalizedLibrary] = useState<
    PersonalizedView[] | null
  >(null);
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const lib = useAtomValue(currentLibraryAtom);

  const isCoverSquareAspectRatio = lib?.settings.coverAspectRatio === 1;

  useEffect(() => {
    const fetchShelfs = async () => {
      setLoading(true);
      const { error, data } = await getPersonalizedLibrary(currentLibraryId);
      if (error) {
        // TODO Better
        console.log("[PERSONALIZED_LIBRARY] ", error);
      }

      setPersonalizedLibrary(data);
      setLoading(false);
    };

    fetchShelfs();
  }, [currentLibraryId]);

  return (
    <YStack h={"100%"} w={"100%"} bg={"$background"} alignContent="center">
      <SectionHeader />
      {loading ? (
        <Spinner
          pos={"absolute"}
          t={"50%"}
          left={"50%"}
          style={{
            transform: [{ translateY: -50 }],
          }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          px={"$2"}
          bg={"$background"}
          space={"$4"}
          h={"100%"}
        >
          {personalizedLibrary?.map((library: PersonalizedView) => (
            <BookShelf
              isCoverSquareAspectRatio={isCoverSquareAspectRatio}
              key={library.id}
              shelf={library}
            />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
};

export default HomePage;
