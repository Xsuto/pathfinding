import { type Algo, BlockType } from "~/libs/types";
import { maxMovePerSecond, minMovePerSecond } from "~/libs/utils";
import { createStore } from "solid-js/store";
import { createEffect, createSignal, onMount } from "solid-js";
import { isServer } from "solid-js/web";

interface Maze {
	id: string;
	type: Algo;
}

interface SettingsState {
	savedBoards: { id: string; title: string; url: string }[];
	movesPerSecond: number;
	paintMode: BlockType;
	mazes: Maze[];
}

const [store, setStore] = createStore<SettingsState>({
	savedBoards: [],
	movesPerSecond: Math.max(minMovePerSecond, Math.ceil(maxMovePerSecond / 4)),
	paintMode: BlockType.TERRAIN_IMPOSSIBLE,
	mazes: [
		{
			type: "Astar",
			id: crypto.randomUUID(),
		},
	],
});

const [hydrated, setHydrated] = createSignal(false);

export function useSettingsStore() {
	onMount(() => {
		if (isServer || hydrated()) return;
		const savedState = localStorage.getItem("settings-state");
		if (savedState) {
			setStore(JSON.parse(savedState));
		}
		createEffect(() => {
			localStorage.setItem("settings-state", JSON.stringify(store));
		});

		setHydrated(true);
	});

	function saveBoard(data: { title: string; url: string }) {
		setStore({
			...store,
			savedBoards: [{ ...data, id: crypto.randomUUID() }, ...store.savedBoards],
		});
	}

	function deleteBoard(id: string) {
		setStore({
			...store,
			savedBoards: store.savedBoards.filter((it) => it.id !== id),
		});
	}

	function updateMovesPerSecond(moves: number) {
		setStore({ ...store, movesPerSecond: moves });
	}
	function updatePaintMode(mode: BlockType) {
		setStore({ ...store, paintMode: mode });
	}

	function addMaze(type: Algo) {
		setStore({
			...store,
			mazes: [
				...store.mazes,
				{
					type,
					id: crypto.randomUUID(),
				},
			],
		});
	}

	function removeMaze(id: string) {
		setStore({
			...store,
			mazes: store.mazes.filter((it) => it.id !== id),
		});
	}

	return {
		state: store,
		saveBoard,
		deleteBoard,
		updateMovesPerSecond,
		updatePaintMode,
		addMaze,
		removeMaze,
	};
}
