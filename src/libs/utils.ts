import { aStar, bfs, bidirectionalSearch, dfs, dijkstra } from "./algos";
import type { Algo, AlgorithmProps, Grid, Position } from "./types";
import { BlockType } from "./types";

export const minMovePerSecond = 1;
export const maxMovePerSecond = 50;

export function encodeGrid(grid: Grid) {
	const rows = grid.map((row) => row.join(""));

	const withoutEncoding = rows.join("-");
	const encoded = rows
		.map((row) => {
			if (!row) return "";
			let result = "";
			let count = 1;
			let current = row[0];

			for (let i = 1; i <= row.length; i++) {
				if (row[i] === current) {
					count++;
				} else {
					if (count > 1) {
						result += `${count}c${current}v`;
					} else {
						result += `${current}v`;
					}
					current = row[i];
					count = 1;
				}
			}
			return result;
		})
		.join("-");
	return withoutEncoding.length > encoded.length ? encoded : withoutEncoding;
}

export function decodeGrid(grid: string) {
	const hasEncoding = grid.includes("c");
	return hasEncoding
		? grid.split("-").map((str: string) => {
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
			})
		: grid
				.split("-")
				.map((str: string) => str.split("").map(Number) as BlockType[]);
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
	return Array(rows).fill(Array(cols).fill(BlockType.TERRAIN_EASY));
}

export const algoTypeToFunc = {
	Astar: aStar,
	DFS: dfs,
	BFS: bfs,
	BI: bidirectionalSearch,
	Dijkstra: dijkstra,
} satisfies Record<Algo, (props: AlgorithmProps) => Promise<Position[] | null>>;

export const algoTypeToTitle = {
	BFS: "Breadth first search",
	DFS: "Depth first search",
	Astar: "A* search",
	BI: "Bidirectional search",
	Dijkstra: "Dijkstra search",
} satisfies Record<Algo, string>;

export const paintModes = [
	{ label: "Start Node", type: BlockType.START },
	{ label: "Goal Node", type: BlockType.GOAL },
	{
		label: "Easy Path",
		type: BlockType.TERRAIN_EASY,
	},
	{
		label: "Medium Path",
		type: BlockType.TERRAIN_MEDIUM,
	},
	{
		label: "Hard Path",
		type: BlockType.TERRAIN_HARD,
	},
	{
		label: "Wall",
		type: BlockType.TERRAIN_IMPOSSIBLE,
	},
];
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
		rows: 25,
		cols: 75,
	},
] as const;
