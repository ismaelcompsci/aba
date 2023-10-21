import { useLocalSearchParams } from "expo-router";
import { Text } from "tamagui";

import { ScreenCenter } from "../../components/center";

const BookPage = () => {
  const { id } = useLocalSearchParams();
  return (
    <ScreenCenter>
      <Text>BOOK {id}</Text>
    </ScreenCenter>
  );
};

export default BookPage;
