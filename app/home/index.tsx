import { useAtomValue } from "jotai/react";
import { useEffect, useState } from "react";
import { ScrollView, YStack } from "tamagui";
import { currentLibraryAtom } from "../../utils/local-atoms";
import { getPersonalizedLibrary } from "../../api/library";
import { PersonalizedView } from "../../types/server";
import BookShelf from "../../components/book/book-shelf";

const HomePage = () => {
  const [personalizedLibrary, setPersonalizedLibrary] = useState<
    PersonalizedView[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const currentLibrary = useAtomValue(currentLibraryAtom);

  useEffect(() => {
    const fetchShelfs = async () => {
      const { error, data } = await getPersonalizedLibrary(currentLibrary);
      if (error) {
        // TODO Better
        console.log("[PERSONALIZED_LIBRARY] ", error);
      }

      setPersonalizedLibrary(data);
    };

    fetchShelfs();
  }, []);

  return (
    <YStack h={"100%"} bg={"$background"} p={"$2"}>
      <ScrollView space={"$4"} h={"100%"}>
        {personalizedLibrary?.map((library: PersonalizedView) => (
          <BookShelf key={library.id} shelf={library} />
        ))}
      </ScrollView>
    </YStack>
  );
};

export default HomePage;
