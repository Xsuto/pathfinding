import type { JSX } from "solid-js";
import {
	ContextMenu as ShadcnContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { BlockType } from "~/libs/types";
import { useSettingsStore } from "~/stores/settings-store";

export function ContextMenu({ children }: { children: JSX.Element }) {
	const { updatePaintMode } = useSettingsStore();
	return (
		<ShadcnContextMenu>
			<ContextMenuTrigger>
				{ children }
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onSelect={() => updatePaintMode(BlockType.WALL)}>
					Set to wall
				</ContextMenuItem>
				<ContextMenuItem onSelect={() => updatePaintMode(BlockType.VISITED)}>
					Set to visited remove me
				</ContextMenuItem>
				<ContextMenuItem onSelect={() => updatePaintMode(BlockType.START)}>
					Set to start point
				</ContextMenuItem>
				<ContextMenuItem onSelect={() => updatePaintMode(BlockType.GOAL)}>
					Set to goal point
				</ContextMenuItem>
				<ContextMenuItem onSelect={() => updatePaintMode(BlockType.EMPTY)}>
					Set to empty
				</ContextMenuItem>
			</ContextMenuContent>
		</ShadcnContextMenu>
	);
}
