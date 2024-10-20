import { aStar, bfs, bidirectionalSearch, dfs } from "./algos";
import type { Algo, AlgorithmProps, Grid, Position } from "./types";
import { BlockType } from "./types";

export const minMovePerSecond = 1;
export const maxMovePerSecond = 50;

export function encodeGrid(grid: Grid) {
	return grid
		.map((row) => {
			const str = row.join("");
			if (!str) return "";
			let result = "";
			let count = 1;
			let current = str[0];

			for (let i = 1; i <= str.length; i++) {
				if (str[i] === current) {
					count++;
				} else {
					if (count > 1) {
						result += `${count}c${current}v`;
					} else {
						result += `${current}v`;
					}
					current = str[i];
					count = 1;
				}
			}
			return result;
		})
		.join("-");
}

export function decodeGrid(grid: string) {
	return grid.split("-").map((str: string) => {
		if (!str) return "";
		let result = "";

		const parts = str.split("v");
		for (const part of parts) {
			if (!part) continue;

			const [count, char] = part.split("c");
			if (char) {
				result += char.repeat(Number.parseInt(count));
			} else {
				result += part;
			}
		}

		return result.split("").map(Number) as BlockType[];
	});
}

export function findBlockTypeInGrid(grid: Grid, type: BlockType) {
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[0]!.length; j++) {
			if (grid[i]![j] === type) {
				return [i, j] satisfies Position;
			}
		}
	}
	return undefined;
}

export function clearGrid(rows: number, cols: number): Grid {
	return Array(rows).fill(Array(cols).fill(BlockType.EMPTY));
}

export const algoTypeToFunc = {
	Astar: aStar,
	DFS: dfs,
	BFS: bfs,
	BI: bidirectionalSearch,
} satisfies Record<Algo, (props: AlgorithmProps) => Promise<Position[] | null>>;

export const algoTypeToTitle = {
	BFS: "Breath first search",
	DFS: "Depth first search",
	Astar: "A* search",
	BI: "Bidirectional search",
} satisfies Record<Algo, string>;

export const boardSizes = [
	{
		type: "Small",
		rows: 11,
		cols: 11,
	},
	{
		type: "Medium",
		rows: 15,
		cols: 25,
	},
	{
		type: "Large",
		rows: 19,
		cols: 39,
	},
	{
		type: "Giant",
		rows: 30,
		cols: 70,
	},
] as const;
