
export interface BoardSize {
	type: string;
	rows: number;
	cols: number;
}

export enum BlockType {
	EMPTY = 0,
	VISITED = 1,
	START = 2,
	GOAL = 3,
	WALL = 4, 
}

export type Grid = BlockType[][];
export type Position = [number, number];

export class AlgorithmAborted extends Error {}

export type Algo = "Astar" | "BFS" | "DFS" | "BI";

export interface AlgorithmProps {
	start: Position;
	goal: Position;
	rows: number;
	cols: number;
	grid: number[][];
	updateCell: (row: number, col: number, value: number) => Promise<void>;
}
