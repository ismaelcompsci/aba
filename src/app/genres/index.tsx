import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";

import { PageView } from "../../components/tab-pages/page-view";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { LibraryFilterData } from "../../types/aba";

const GenresPage = () => {
  const [user] = useAtom(userAtom);
  const [currentLibraryId] = useAtom(currentLibraryIdAtom);
  const [serverConfig] = useAtom(currentServerConfigAtom);

  const { data: filterData } = useQuery({
    queryKey: ["filter-data", currentLibraryId, user?.id, serverConfig?.id],
    queryFn: async () => {
      if (!serverConfig?.id) return null;
      const { data }: { data: LibraryFilterData } = await axios.get(
        `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/filterdata`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      return data;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnMount: true,
  });
  return <PageView flex={1}></PageView>;
};

export default GenresPage;
