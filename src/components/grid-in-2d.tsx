import { type Accessor, Index, createMemo } from "solid-js";
import { useMouseDown } from "~/hooks/useMouseDown";
import { cn } from "~/libs/cn";
import { BlockType, type Grid, type Position } from "~/libs/types";
import { CellContent } from "./cell-content";

const getCellColor = (
  cellValue: () => BlockType,
  i: number,
  j: number,
  finalPath: () => Grid,
  visitedCells: () => Position[],
) => {
  if (cellValue() === BlockType.START) return "bg-green-500";
  if (cellValue() === BlockType.GOAL) return "bg-red-500 text-white";
  if (cellValue() === BlockType.TERRAIN_IMPOSSIBLE) return "bg-stone-400";
  if (finalPath().some(([x, y]) => x === i && y === j)) return "bg-green-900";
  if (visitedCells().some(([x, y]) => x === i && y === j))
    return "bg-green-700";
  return "bg-stone-200";
};

const getBlockTypeString = (
  cellValue: () => BlockType,
  i: number,
  j: number,
  finalPath: () => Grid,
): string => {
  if (finalPath().some(([x, y]) => x === i && y === j)) return "Final path";
  switch (cellValue()) {
    case BlockType.START:
      return "Start";
    case BlockType.GOAL:
      return "Goal";
    case BlockType.TERRAIN_EASY:
      return "Easy difficulty terrain";
    case BlockType.TERRAIN_MEDIUM:
      return "Medium difficulty terrain";
    case BlockType.TERRAIN_HARD:
      return "Hard difficulty terrain";
    case BlockType.TERRAIN_IMPOSSIBLE:
      return "Impossible difficulty terrain";
    default:
      return "Unknown type";
  }
};

export function GridIn2D({
  grid,
  updateCell,
  visitedCells,
  finalPath,
  isRunning,
}: {
  grid: Accessor<Grid>;
  visitedCells: Accessor<Position[]>;
  updateCell: (row: number, col: number) => void;
  finalPath: Accessor<Position[]>;
  isRunning: Accessor<boolean>;
}) {
  const isMouseDown = useMouseDown();
  const rows = createMemo(() => grid()?.length);
  const cols = createMemo(() => grid()?.at(0)?.length ?? 0);

  const handleCellInteraction = (i: number, j: number, e?: MouseEvent) => {
    if (e && e.buttons !== 1) return;
    updateCell(i, j);
  };

  return (
    <div
      class={cn("grid gap-0 w-auto max-h-full max-w-full overflow-hidden")}
      style={{
        "grid-template-rows": `repeat(${rows()}, 1fr)`,
        "grid-template-columns": `repeat(${cols()}, 1fr)`,
      }}
    >
      <Index each={grid()}>
        {(rows, rowsIndex) => (
          <Index each={rows()}>
            {(cell, colIndex) => (
              <button
                type="button"
                class={cn(
                  "border border-stone-300 flex items-center justify-center hover:brightness-50 text-xs min-h-4 min-w-4 md:min-w-6 md:min-h-6 tooltip aspect-square",
                  getCellColor(
                    cell,
                    rowsIndex,
                    colIndex,
                    finalPath,
                    visitedCells,
                  ),
                  isRunning()
                    ? "transition-colors duration-500 ease-in-out"
                    : "",
                )}
                onClick={() => handleCellInteraction(rowsIndex, colIndex)}
                onMouseDown={(e) =>
                  handleCellInteraction(rowsIndex, colIndex, e)
                }
                onMouseEnter={(e) => {
                  if (e.buttons === 1 && isMouseDown()) {
                    handleCellInteraction(rowsIndex, colIndex, e);
                  }
                }}
                data-tooltip={getBlockTypeString(
                  cell,
                  rowsIndex,
                  colIndex,
                  finalPath,
                )}
              >
                <CellContent
                  cellValue={cell}
                  i={rowsIndex}
                  j={colIndex}
                  finalPath={finalPath}
                />
              </button>
            )}
          </Index>
        )}
      </Index>
    </div>
  );
}
