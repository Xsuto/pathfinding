import { action } from "@solidjs/router";
import { createSignal, Show, For, type Accessor } from "solid-js";
import { BlockType } from "~/libs/types";
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
  const items = [
    { label: "Start Node", action: () => updatePaintMode(BlockType.START) },
    { label: "Goal Node", action: () => updatePaintMode(BlockType.GOAL) },
    {
      label: "Easy Path",
      action: () => updatePaintMode(BlockType.TERRAIN_EASY),
    },
    {
      label: "Medium Path",
      action: () => updatePaintMode(BlockType.TERRAIN_MEDIUM),
    },
    {
      label: "Hard Path",
      action: () => updatePaintMode(BlockType.TERRAIN_HARD),
    },
    {
      label: "Wall",
      action: () => updatePaintMode(BlockType.TERRAIN_IMPOSSIBLE),
    },
  ];

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
          <For each={items}>
            {(item) => (
              <button
                type="button"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 w-full"
                onClick={() => {
                  item.action();
                  onClickOutside();
                }}
              >
                <span>{item.label}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}
