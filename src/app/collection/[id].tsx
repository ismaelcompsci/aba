import { useLocalSearchParams } from "expo-router";

import { Screen } from "../../components/layout/screen";

const CollectionsPage = () => {
  const { id } = useLocalSearchParams();
  return <Screen></Screen>;
};

export default CollectionsPage;
