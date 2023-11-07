import { MoreHorizontal } from "@tamagui/lucide-icons";
import { useSetAtom } from "jotai";
import { Button } from "tamagui";
import * as DropdownMenu from "zeego/dropdown-menu";

import { MediaProgress } from "../../types/aba";
import { appDialogAtom } from "../dialogs/app-dialog";

const BookMoreMenu = ({
  userMediaProgress,
  title,
  itemId,
}: {
  userMediaProgress: MediaProgress | undefined;
  title: string | null;
  itemId: string;
}) => {
  const setAppDialog = useSetAtom(appDialogAtom);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button>
          <MoreHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Book Actions</DropdownMenu.Label>
        <DropdownMenu.Item
          key="mark_as_finshed"
          onSelect={() =>
            setAppDialog({
              open: true,
              title: "Mark as Finshed",
              description: `Are you sure you want to mark ${
                title ? title : "this book"
              } as finshed`,
              action: "mark_as_finshed",
              itemId,
            })
          }
        >
          <DropdownMenu.ItemTitle>Mark as Finished</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon ios={{ name: "checkmark.seal.fill" }} />
        </DropdownMenu.Item>
        {userMediaProgress ? (
          <DropdownMenu.Item
            key="discard_progress"
            destructive
            onSelect={() =>
              setAppDialog({
                open: true,
                title: "Discard Progress",
                description: "Are you sure you want to discard progress",
                action: "progress",
                progressId: userMediaProgress.id,
              })
            }
          >
            <DropdownMenu.ItemTitle>Discard Progress</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon ios={{ name: "trash.fill" }} />
          </DropdownMenu.Item>
        ) : null}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default BookMoreMenu;
