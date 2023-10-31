import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";

import { FullScreen } from "../../../components/center";
import LibraryPage from "../../../components/tab-pages/library-page";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../../../state/app-state";
import { currentServerConfigAtom } from "../../../state/local-state";

const GenrePage = () => {
  const { genre } = useLocalSearchParams();
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const library = useAtomValue(currentLibraryAtom);
  const user = useAtomValue(userAtom);

  return (
    <FullScreen>
      <LibraryPage
        currentLibraryId={currentLibraryId}
        serverConfig={serverConfig}
        library={library}
        user={user}
        filter={`genres.${genre}`}
      />
    </FullScreen>
  );
};

export default GenrePage;
