import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";

import { Screen } from "../../../components/layout/screen";
import LibraryPage from "../../../components/tab-pages/library-page";
import {
  currentLibraryIdAtom,
  isCoverSquareAspectRatioAtom,
  userTokenAtom,
} from "../../../state/app-state";
import { currentServerConfigAtom } from "../../../state/local-state";

const FilterPage = () => {
  const { filter, id } = useLocalSearchParams();

  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const userToken = useAtomValue(userTokenAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  if (!userToken) {
    // TODO BETTER ERROR
    return null;
  }

  return (
    <Screen>
      <LibraryPage
        currentLibraryId={currentLibraryId}
        serverConfig={serverConfig}
        filter={`${filter}.${id}`}
        isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        userToken={userToken}
      />
    </Screen>
  );
};

export default FilterPage;
