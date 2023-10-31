import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";

import { FullScreen } from "../../../components/center";
import LibraryPage from "../../../components/tab-pages/library-page";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../../../state/app-state";
import { currentServerConfigAtom } from "../../../state/local-state";
import { encode } from "../../../utils/utils";

const SeriesPage = () => {
  const { id } = useLocalSearchParams();

  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const library = useAtomValue(currentLibraryAtom);
  const user = useAtomValue(userAtom);

  if (!id) {
    router.back();
  }

  return (
    <FullScreen>
      <LibraryPage
        currentLibraryId={currentLibraryId}
        serverConfig={serverConfig}
        library={library}
        user={user}
        // @ts-ignore todo
        filter={`series.${encode(id)}`}
      />
    </FullScreen>
  );
};

export default SeriesPage;
