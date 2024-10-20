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
			? (searchParams.algorithms as string).split("-")
			: ["Astar"];
		return algorithms.map((it) => ({
			type: it as Algo,
			id: crypto.randomUUID(),
		}));
	}, [searchParams]);

	const grid = createMemo(() => {
		const grid = searchParams.grid;
		const decodedGrid = grid ? (decodeGrid(grid as string) as Grid) : undefined;

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
			algorithms: [...algorithms().map((it) => it.type), type].join("-"),
		});
	}

	function removeAlgorithm(id: string) {
		setSearchParams({
			...searchParams,
			algorithms: algorithms()
				.filter((it) => it.id !== id)
				.map((it) => it.type)
				.join("-"),
		});
	}

	return {
		grid,
		updateGrid,
		boardSize,
		updateBoardSize,
		algorithms,
		addAlgorithm,
		removeAlgorithm,
	};
}
