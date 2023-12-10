import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { Text } from "tamagui";

import BackHeader from "../../../components/layout/back-header";
import { Screen } from "../../../components/layout/screen";
import LibraryPage from "../../../components/tab-pages/library-page";
import { useAppSafeAreas } from "../../../hooks/use-app-safe-areas";
import {
  currentLibraryIdAtom,
  isCoverSquareAspectRatioAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../../state/app-state";
import { decode } from "../../../utils/utils";

const FilterPage = () => {
  const { filter, id, name } = useLocalSearchParams();

  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const userToken = useAtomValue(userTokenAtom);
  const isCoverSquareAspectRatio = useAtomValue(isCoverSquareAspectRatioAtom);
  const serverAddress = useAtomValue(serverAddressAtom);

  const { left, right } = useAppSafeAreas();

  if (!userToken) {
    return null;
  }

  return (
    <Screen edges={["top"]}>
      <BackHeader alignment="center" mx={16} pl={left} pr={right} py={16}>
        <Text numberOfLines={1} fontSize="$6">
          {name || decode(id as string)}
        </Text>
      </BackHeader>
      <LibraryPage
        currentLibraryId={currentLibraryId}
        serverAddress={serverAddress}
        filter={`${filter}.${id}`}
        isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        userToken={userToken}
      />
    </Screen>
  );
};

export default FilterPage;
