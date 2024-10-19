import { aStar, bfs, bidirectionalSearch, dfs } from "./algos";
import type { Algo, AlgorithmProps, Grid, Position } from "./types";
import { BlockType } from "./types";

export const minMovePerSecond = 1;
export const maxMovePerSecond = 30;

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

export function clearGrid(rows: number, cols: number) {
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
		rows: 100,
		cols: 40,
	},
] as const;
