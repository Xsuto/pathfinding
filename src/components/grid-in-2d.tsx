import { useMouseDown } from "~/hooks/useMouseDown";
import { BlockType, type Grid } from "~/libs/types";
import type { GridRendererProps } from "./maze";
import { cn } from "~/libs/cn";
import { Index, createMemo } from "solid-js";
import { CellContent } from "./cell-content";

const getCellColor = (
	cellValue: () => number,
	i: number,
	j: number,
	finalPath: () => Grid,
) => {
	if (cellValue() === BlockType.START) return "bg-green-500";
	if (cellValue() === BlockType.GOAL) return "bg-red-500 text-white";
	if (finalPath().some(([x, y]) => x === i && y === j)) return "bg-green-900";
	if (cellValue() === BlockType.VISITED) { console.log("HERE"); return "bg-green-600"};
	if (cellValue() === BlockType.WALL) return "bg-stone-400";
	return "bg-stone-200";
};

const getBlockTypeString = (cellValue: number): string => {
	switch (cellValue) {
		case BlockType.START:
			return "Start";
		case BlockType.GOAL:
			return "Goal";
		case BlockType.VISITED:
			return "Visited";
		case BlockType.WALL:
			return "Wall";
		default:
			return "Empty";
	}
};

export function GridIn2D({
	grid,
	updateCell,
	finalPath,
	classProp,
}: GridRendererProps) {
	const isMouseDown = useMouseDown();
	const rows = createMemo(() => grid()?.length);
	const cols = createMemo(() => grid()?.at(0)?.length ?? 0);

	const handleCellInteraction = (i: number, j: number, e?: MouseEvent) => {
		if (e && e.buttons !== 1) return;
		updateCell(i, j);
	}

	return (
		<div
			class={cn(
				"grid gap-0 w-auto max-h-full max-w-full overflow-auto",
				classProp,
			)}
			style={{
				"grid-template-rows": `repeat(${rows()}, 1fr)`,
				"grid-template-columns": `repeat(${cols()}, 1fr)`,
				"aspect-ratio": `${cols()} / ${rows()}`,
			}}
		>
			<Index each={grid()}>
				{(rows, rowsIndex) => 
					<Index each={rows()}>
						{(cell, colIndex) => 
								<button
									type="button"
									class={cn(
										"border border-stone-300 flex items-center justify-center hover:brightness-50 text-xs min-h-4 min-w-4 tooltip",
										getCellColor(cell, rowsIndex, colIndex, finalPath)
									)}
									onClick={() => handleCellInteraction(rowsIndex, colIndex)}
									onMouseDown={(e) => handleCellInteraction(rowsIndex, colIndex, e)}
									onMouseEnter={(e) => {
										if (e.buttons === 1 && isMouseDown()) {
											handleCellInteraction(rowsIndex, colIndex, e);
										}
									}}
									data-tooltip={getBlockTypeString(cell())}
								>
									<CellContent
										cellValue={cell}
										i={rowsIndex}
										j={colIndex}
										finalPath={finalPath}
									/>
								</button>
						}
					</Index>
				}
			</Index>
		</div>
	);
}
