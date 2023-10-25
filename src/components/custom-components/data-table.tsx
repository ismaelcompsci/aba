import { H3, ListItem, ScrollView, XStack, YStack } from "tamagui";

export function DataTable<T>({
  title = "",
  data,
  renderItem,
}: {
  title?: string;
  data: T[]; // Annotate data as an array of type T
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <ScrollView>
      <YStack borderWidth={1} borderColor="$borderColor" f={1} ov="hidden">
        {!!title && (
          <XStack ai="center" py="$2" px="$4" backgroundColor="$borderColor">
            <H3 size="$3">{title}</H3>
          </XStack>
        )}

        <ScrollView minHeight={100} maxHeight={300} overScrollMode="auto">
          {data.map((item, i) => (
            <ListItem key={i} p={0}>
              {renderItem(item)}
            </ListItem>
          ))}
        </ScrollView>
      </YStack>
    </ScrollView>
  );
}
