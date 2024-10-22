import { AiOutlineDelete } from "solid-icons/ai";
import { BsThreeDots } from "solid-icons/bs";
import { For } from "solid-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useUrlState } from "~/hooks/useUrlState";
import type { BoardSize } from "~/libs/types";
import { boardSizes, maxMovePerSecond, minMovePerSecond } from "~/libs/utils";
import { useSettingsStore } from "~/stores/settings-store";
import { Button } from "./ui/button";

export function SettingsDropDownMenu({
  onBoardSizeChange,
}: {
  onBoardSizeChange: (size: BoardSize) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <BsThreeDots class="size-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-32 lg:min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Settings</DropdownMenuGroupLabel>
          <DropdownMenuSeparator />
          <MovesPerSecondMenuItem />
          <SavedBoardsSubMenu />
          <ChangeBoardSizeSubMenu onChange={onBoardSizeChange} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SavedBoardsSubMenu() {
  const { state, deleteBoard } = useSettingsStore();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span>Saved Boards</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {state.savedBoards.length > 0 ? (
          <For each={state.savedBoards}>
            {(board) => (
              <DropdownMenuItem class="flex gap-2" closeOnSelect={false}>
                <button
                  class="flex-1 text-start"
                  type="button"
                  onClick={() => {
                    window.location.replace(board.url);
                  }}
                >
                  {board.title}
                </button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteBoard(board.id);
                  }}
                >
                  <AiOutlineDelete />
                </Button>
              </DropdownMenuItem>
            )}
          </For>
        ) : (
          <DropdownMenuItem>Empty</DropdownMenuItem>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function MovesPerSecondMenuItem() {
  const { state, updateMovesPerSecond } = useSettingsStore();
  return (
    <DropdownMenuItem class="flex flex-col gap-2" closeOnSelect={false}>
      <span class="w-full">
        {`Speed: ${minMovePerSecond === state.movesPerSecond ? "Slowest" : state.movesPerSecond < maxMovePerSecond / 4 ? "Slow" : state.movesPerSecond < maxMovePerSecond / 2 ? "Normal" : state.movesPerSecond === maxMovePerSecond ? "Instant (No animation)" : "Fast"}`}
      </span>
      <input
        type="range"
        min={minMovePerSecond}
        max={maxMovePerSecond}
        step={1}
        value={state.movesPerSecond}
        onChange={(e) =>
          updateMovesPerSecond(e.target.valueAsNumber || minMovePerSecond)
        }
        class="w-full"
      />
    </DropdownMenuItem>
  );
}

function ChangeBoardSizeSubMenu({
  onChange,
}: { onChange: (size: BoardSize) => void }) {
  const { boardSize } = useUrlState();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span>Change size</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <For each={boardSizes}>
          {(size) => (
            <DropdownMenuItem onSelect={() => onChange(size)}>
              <span>
                {size.type} {size.type === boardSize().type ? "(Current)" : ""}
              </span>
            </DropdownMenuItem>
          )}
        </For>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
