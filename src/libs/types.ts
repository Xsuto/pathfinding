
export interface BoardSize {
	type: string;
	rows: number;
	cols: number;
}

export enum BlockType {
	START = 1,
	GOAL = 2,
	TERRAIN_EASY = 3,
	TERRAIN_MEDIUM = 4,
	TERRAIN_HARD = 5,
	TERRAIN_IMPOSSIBLE = 6
}

export type Grid = BlockType[][];
export type Position = [number, number];

export class AlgorithmAborted extends Error {}

export type Algo = "Astar" | "BFS" | "DFS" | "BI" | "Dijkstra";

export interface AlgorithmProps {
	start: Position;
	goal: Position;
	rows: number;
	cols: number;
	grid: number[][];
	markCellAsVisited: (row: number, col: number) => Promise<void>;
}
