import { useSearchParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import type { BlockType, BoardSize } from "~/libs/types";
import { boardSizes } from "~/libs/utils";

export function useUrlState() {
	const [searchParams, setSearchParams] = useSearchParams();

	const gridFromUrl = createMemo(() => {
		const { grid, ...rest } = searchParams;
		if (!grid) return undefined;
		setSearchParams({ ...rest, grid: undefined });

		return grid
			.split("-")
			.map((row) => row.split("").map(Number) as BlockType[]);
	}, [searchParams]);

	const boardSize = createMemo(() => {
		return (
			boardSizes.find((it) => it.type === searchParams.boardSizeType) ??
			boardSizes.find((it) => it.type === "Medium")!
		);
	}, [searchParams]);

	function updateBoardSize(size: BoardSize) {
		setSearchParams({ ...searchParams, boardSizeType: size.type });
	}

	return {
		gridFromUrl,
		boardSize,
		updateBoardSize,
	};
}
