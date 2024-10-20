import { useSearchParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import type { BoardSize, Grid } from "~/libs/types";
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

	const grid = createMemo(() => {
		const grid = searchParams.grid;
		const decodedGrid = grid ? (decodeGrid(grid as string) as Grid) : undefined;
		return isUrlGridValid(boardSize(), decodedGrid)
			? decodedGrid!
			: updateGrid(clearGrid(boardSize().rows, boardSize().cols));
	}, [searchParams]);

	function updateBoardSize(size: BoardSize) {
		setSearchParams({ ...searchParams, boardSizeType: size.type });
	}

	function updateGrid(grid: Grid) {
		setSearchParams({ ...searchParams, grid: encodeGrid(grid) });
	}

	return {
		grid,
		updateGrid,
		boardSize,
		updateBoardSize,
	};
}
