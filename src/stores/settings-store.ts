import { BlockType } from "~/libs/types";
import { maxMovePerSecond, minMovePerSecond } from "~/libs/utils";
import { createStore } from "solid-js/store";
import { createEffect, createSignal, onMount } from "solid-js";
import { isServer } from "solid-js/web";

interface SettingsState {
	savedBoards: { id: string; title: string; url: string }[];
	movesPerSecond: number;
	paintMode: BlockType;
}

const [store, setStore] = createStore<SettingsState>({
	savedBoards: [],
	movesPerSecond: Math.max(minMovePerSecond, Math.ceil(maxMovePerSecond / 4)),
	paintMode: BlockType.TERRAIN_IMPOSSIBLE,
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
		console.log(mode);
		setStore({ ...store, paintMode: mode });
	}

	return {
		state: store,
		saveBoard,
		deleteBoard,
		updateMovesPerSecond,
		updatePaintMode,
	};
}
