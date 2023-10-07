import { useAtomValue } from "jotai/react";
import { useEffect, useState } from "react";
import { ScrollView, Spinner, YStack } from "tamagui";

import { currentLibraryIdAtom } from "../../utils/local-atoms";
import { getPersonalizedLibrary } from "../../api/library";
import { PersonalizedView } from "../../types/server";
import BookShelf from "../../components/book/book-shelf";
import { currentLibraryAtom } from "../../utils/atoms";

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
    <YStack
      h={"100%"}
      bg={"$background"}
      p={"$2"}
      justifyContent="center"
      alignContent="center"
    >
      {loading ? (
        <Spinner />
      ) : (
        <ScrollView bg={"$background"} space={"$4"} h={"100%"}>
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
