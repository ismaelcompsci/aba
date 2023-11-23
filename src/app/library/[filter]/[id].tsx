import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { Text } from "tamagui";

import BackHeader from "../../../components/layout/back-header";
import { Screen } from "../../../components/layout/screen";
import LibraryPage from "../../../components/tab-pages/library-page";
import {
  currentLibraryIdAtom,
  isCoverSquareAspectRatioAtom,
  userTokenAtom,
} from "../../../state/app-state";
import { currentServerConfigAtom } from "../../../state/local-state";
import { decode } from "../../../utils/utils";

const FilterPage = () => {
  const { filter, id, name } = useLocalSearchParams();

  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const userToken = useAtomValue(userTokenAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);

  if (!userToken) {
    return null;
  }

  return (
    <Screen edges={["top"]}>
      <BackHeader alignment="center" mx={16} py={16}>
        <Text numberOfLines={1} fontSize="$6">
          {name || decode(id as string)}
        </Text>
      </BackHeader>
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
