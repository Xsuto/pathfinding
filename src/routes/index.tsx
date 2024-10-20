import { ContextMenu, useContextMenu } from "~/components/context-menu";
import { BlockType, type Position } from "~/libs/types";
import {
	algoTypeToFunc,
	algoTypeToTitle,
	clearGrid,
	findBlockTypeInGrid,
} from "~/libs/utils";
import { useSettingsStore } from "~/stores/settings-store";
import { For, createMemo, createSignal, startTransition } from "solid-js";
import { Maze, type MazeHandle } from "~/components/maze";
import { useUrlState } from "~/hooks/useUrlState";
import { BoardHeader } from "~/components/board-header";
import { BoardFooter } from "~/components/board-footer";

export default function Home() {
	const { grid, updateGrid, boardSize, algorithms, removeAlgorithm } =
		useUrlState();
	const { state } = useSettingsStore();

	const startPoint = createMemo<Position | undefined>(() =>
		findBlockTypeInGrid(grid(), BlockType.START),
	);

	const goalPoint = createMemo<Position | undefined>(() =>
		findBlockTypeInGrid(grid(), BlockType.GOAL),
	);

	const [mazeRefs] = createSignal<Map<string, MazeHandle>>(new Map());

	const setMazeRef = (id: string, handle: MazeHandle | null) => {
		if (handle) {
			mazeRefs().set(id, handle);
		} else {
			mazeRefs().delete(id);
		}
	};

	const mazes = createMemo(() =>
		algorithms().map((it) => ({
			...it,
			algo: algoTypeToFunc[it.type],
		})),
	);

	const { onContextMenu, isOpen, onClickOutside, position } = useContextMenu();

	const runAllMazes = () => {
		const promises = Array.from(mazeRefs().values())
			.filter((maze) => !maze.isRunning)
			.map((maze) => maze.start());
		return Promise.all(promises);
	};

	const resetAllMazes = () => {
		const promises = Array.from(mazeRefs().values()).map((maze) =>
			maze.restart(),
		);
		return Promise.all(promises);
	};

	return (
		<div class="md:p-4 border rounded-xl border-stone-300 shadow-lg flex flex-col justify-between  relative lg:mx-4 flex-grow overflow-hidden">
			<BoardHeader />
			<main
				onContextMenu={onContextMenu}
				class="flex flex-wrap overflow-auto contain-content gap-4 relative justify-center"
			>
				<For each={mazes()}>
					{(maze) => (
						<Maze
							ref={(handle) => setMazeRef(maze.id, handle)}
							sharedGrid={grid}
							updateSharedGridCell={(row: number, col: number) => {
								if (
									Array.from(mazeRefs().values()).some((maze) => maze.isRunning)
								)
									return;
								startTransition(() => {
									const newGrid = grid().map((value, i) =>
										value.map((val, j) => {
											if (
												state.paintMode === BlockType.GOAL ||
												state.paintMode === BlockType.START
											) {
												return i === row && j === col
													? state.paintMode
													: val === state.paintMode
														? BlockType.TERRAIN_EASY
														: val;
											}
											return i === row && j === col ? state.paintMode : val;
										}),
									);
									updateGrid(newGrid);
								});
							}}
							algorithm={maze.algo}
							algorithmName={algoTypeToTitle[maze.type]}
							startPoint={startPoint}
							goalPoint={goalPoint}
							removeMaze={() => removeAlgorithm(maze.id)}
						/>
					)}
				</For>
			</main>
			<ContextMenu
				onClickOutside={onClickOutside}
				isOpen={isOpen}
				position={position}
				onContextMenu={onContextMenu}
			/>
			<BoardFooter
				canStartMazes={() => !!startPoint() && !!goalPoint()}
				runAllMazes={runAllMazes}
				resetAllMazes={resetAllMazes}
				clearGrid={() =>
					updateGrid(clearGrid(boardSize().rows, boardSize().cols))
				}
			/>
		</div>
	);
}
