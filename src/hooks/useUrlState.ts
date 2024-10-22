import { useSearchParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import type { Algo, BoardSize, Grid } from "~/libs/types";
import { boardSizes, clearGrid, encodeGrid } from "~/libs/utils";
import { decodeGrid } from "~/libs/utils";

function isUrlGridValid(boardSize: BoardSize, grid?: Grid) {
  return (
    grid && grid.length === boardSize.rows && grid[0]?.length === boardSize.cols
  );
}

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const boardSize = createMemo(() => {
    return (
      boardSizes.find((it) => it.type === searchParams.boardSizeType) ??
      boardSizes.find((it) => it.type === "Medium")!
    );
  }, [searchParams]);

  const algorithms = createMemo(() => {
    const algorithms = searchParams.algorithms
      ? ((searchParams.algorithms as string).split("-") as Algo[])
      : (["Astar"] as Algo[]);
    return algorithms;
  }, [searchParams]);

  const grid = createMemo(() => {
    const grid = searchParams.grid;
    const decodedGrid = grid ? decodeGrid(grid as string) : undefined;

    if (isUrlGridValid(boardSize(), decodedGrid)) {
      return decodedGrid!;
    }
    const newGrid = clearGrid(boardSize().rows, boardSize().cols);
    updateGrid(newGrid);
    return newGrid;
  }, [searchParams]);

  function updateBoardSize(size: BoardSize) {
    setSearchParams({ ...searchParams, boardSizeType: size.type });
  }

  function updateGrid(grid: Grid) {
    setSearchParams({ ...searchParams, grid: encodeGrid(grid) });
  }

  function addAlgorithm(type: Algo) {
    setSearchParams({
      ...searchParams,
      algorithms: [...algorithms(), type].join("-"),
    });
  }

  function setAlgorithms(algos: Algo[]) {
    setSearchParams({
      ...searchParams,
      algorithms: algos.join("-"),
    });
  }

  function removeAlgorithm(index: number) {
    setSearchParams({
      ...searchParams,
      algorithms: [
        ...algorithms().slice(0, index),
        ...algorithms().slice(index + 1),
      ].join("-"),
    });
  }

  return {
    grid,
    updateGrid,
    boardSize,
    updateBoardSize,
    algorithms,
    setAlgorithms,
    addAlgorithm,
    removeAlgorithm,
  };
}
