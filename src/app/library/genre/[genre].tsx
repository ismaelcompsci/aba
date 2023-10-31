import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";

import LibraryPage from "../../../components/tab-pages/library-page";
import { PageView } from "../../../components/tab-pages/page-view";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../../../state/app-state";
import { currentServerConfigAtom } from "../../../state/local-state";
import { encode } from "../../../utils/utils";

const GenrePage = () => {
  const { genre } = useLocalSearchParams();
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const library = useAtomValue(currentLibraryAtom);
  const user = useAtomValue(userAtom);

  return (
    <PageView flex={1}>
      <LibraryPage
        currentLibraryId={currentLibraryId}
        serverConfig={serverConfig}
        library={library}
        user={user}
        filter={`genres.${encode(genre)}`}
      />
    </PageView>
  );
};

export default GenrePage;
