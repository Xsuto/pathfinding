import { type Algo, BlockType, type BoardSize } from "~/libs/types";
import { boardSizes, maxMovePerSecond } from "~/libs/utils";
import { createStore } from "solid-js/store";
import { createEffect, onMount } from "solid-js";

interface Maze {
	id: string;
	type: Algo;
}

interface SettingsState {
	savedBoards: { id: string; title: string; url: string }[];
	movesPerSecond: number;
	paintMode: BlockType;
	mazes: Maze[];
	boardSize: BoardSize;
}

const [store, setStore] = createStore<SettingsState>({
		savedBoards: [],
		movesPerSecond: maxMovePerSecond,
		boardSize: boardSizes.find((it) => it.type === "Large")!,
		paintMode: BlockType.WALL,
		mazes: [
			{
				type: "Astar",
				id: crypto.randomUUID(),
			},
		],
})

onMount(() => {
	const savedState = localStorage.getItem("settings-state")
	if (savedState) {
		setStore(JSON.parse(savedState))
	}

	createEffect(() => {
		localStorage.setItem("settings-state", JSON.stringify(store))
	})
})



export function useSettingsStore() {

	function saveBoard(data: { title: string; url: string }) {
		setStore({ ...store, 
			savedBoards: [
				{ ...data, id: crypto.randomUUID() },
				...store.savedBoards,
			],
		})
	}

	function deleteBoard(id: string) {
		setStore({...store, savedBoards: store.savedBoards.filter((it) => it.id === id)})
	}

	function updateMovesPerSecond(moves: number) {
		setStore({...store, movesPerSecond: moves })
	}
	function updatePaintMode(mode: BlockType) {
		setStore({...store, paintMode: mode })
	}

	function updateBoardSize(size: BoardSize) {
		setStore({ ...store, boardSize: size })
	}

	function addMaze(type: Algo) {
		setStore({ ...store, mazes:  
			[
				...store.mazes,
				{
					type,
					id: crypto.randomUUID(),
				},
			],
		})}

	function removeMaze(id: string) {
		setStore({ ...store, 
						mazes: store.mazes.filter((it) => it.id !== id),
						})
	}

	return {
		state: store,
		saveBoard,
		deleteBoard,
		updateMovesPerSecond,
		updatePaintMode,
		updateBoardSize,
		addMaze,
		removeMaze
	}
}
