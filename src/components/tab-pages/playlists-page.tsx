import { Screen } from "../layout/screen";

interface PlaylistsPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

const PlaylistsPage = ({
  currentLibraryId,
  isCoverSquareAspectRatio,
  serverAddress,
  userToken,
}: PlaylistsPageProps) => {
  return <Screen></Screen>;
};

export default PlaylistsPage;
