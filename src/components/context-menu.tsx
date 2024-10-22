import { action } from "@solidjs/router";
import { type Accessor, For, Show, createSignal } from "solid-js";
import { BlockType } from "~/libs/types";
import { paintModes } from "~/libs/utils";
import { useSettingsStore } from "~/stores/settings-store";

interface Position {
  x: number;
  y: number;
}

export function useContextMenu() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [position, setPosition] = createSignal<Position>({ x: 0, y: 0 });

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const onClickOutside = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    position,
    onContextMenu,
    onClickOutside,
  };
}

const GENERAL_SECTION_ITEMS = [
  { label: "Start Node", type: BlockType.START },
  { label: "Goal Node", type: BlockType.GOAL },
  { label: "Wall", type: BlockType.TERRAIN_IMPOSSIBLE },
  { label: "Empty", type: BlockType.TERRAIN_EASY },
];

const TERRAIN_SECTION_ITEMS = [
  { label: "Easy Path", type: BlockType.TERRAIN_EASY },
  { label: "Medium Path", type: BlockType.TERRAIN_MEDIUM },
  { label: "Hard Path", type: BlockType.TERRAIN_HARD },
];

export function ContextMenu({
  isOpen,
  onClickOutside,
  position,
  onContextMenu,
}: {
  isOpen: Accessor<boolean>;
  onClickOutside: () => void;
  position: Accessor<{ x: number; y: number }>;
  onContextMenu: (e: MouseEvent) => void;
}) {
  const { updatePaintMode } = useSettingsStore();

  return (
    <Show when={isOpen()}>
      <div
        class="fixed inset-0"
        onClick={onClickOutside}
        onContextMenu={onContextMenu}
      >
        <div
          class="absolute bg-white shadow-lg rounded-md py-2 min-w-[200px]"
          style={{
            left: `${position().x}px`,
            top: `${position().y}px`,
          }}
        >
          <div class="pb-2">
            <div class="px-4 py-1 text-sm font-medium text-gray-500">
              General
            </div>
            <For each={GENERAL_SECTION_ITEMS}>
              {(item) => (
                <MenuItem
                  item={item}
                  onClick={() => {
                    updatePaintMode(item.type);
                    onClickOutside();
                  }}
                />
              )}
            </For>
          </div>
          <div class="border-t border-gray-200 my-1" />
          <div>
            <div class="px-4 py-1 text-sm font-medium text-gray-500">
              Terrain Difficulty
            </div>
            <For each={TERRAIN_SECTION_ITEMS}>
              {(item) => (
                <MenuItem
                  item={item}
                  onClick={() => {
                    updatePaintMode(item.type);
                    onClickOutside();
                  }}
                />
              )}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}

function MenuItem({
  item,
  onClick,
}: { item: { label: string; type: BlockType }; onClick: () => void }) {
  return (
    <button
      type="button"
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full text-left"
      onClick={onClick}
    >
      <span>{item.label}</span>
    </button>
  );
}
