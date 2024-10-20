import { useSearchParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import type { BoardSize, Grid } from "~/libs/types";
import { boardSizes } from "~/libs/utils";
import { decodeGrid } from "~/libs/utils";

export function useUrlState() {
	const [searchParams, setSearchParams] = useSearchParams();

	const gridFromUrl = createMemo(() => {
		const grid = searchParams.grid;
		return grid ? decodeGrid(grid as string) as Grid : undefined;
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
