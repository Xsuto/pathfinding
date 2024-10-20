import { Header } from "~/components/Header";
import { SettingsDropDownMenu } from "~/components/settings-dropdown-menu";
import { Button } from "~/components/ui/button";
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
import { toaster } from "@kobalte/core";
import {
	Toast,
	ToastContent,
	ToastProgress,
	ToastTitle,
} from "~/components/ui/toast";
import { Footer } from "~/components/Footer";
import { Maze, type MazeHandle } from "~/components/maze";
import { useUrlState } from "~/hooks/useUrlState";
import { VsDebugRestart, VsRunAll } from "solid-icons/vs";
import { AiOutlineClear, AiOutlineDelete } from "solid-icons/ai";

export default function Home() {
	const { grid, updateGrid, boardSize, updateBoardSize } = useUrlState();
	const { state, saveBoard, removeMaze } = useSettingsStore();

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
		state.mazes.map((it) => ({
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
		<div class="flex flex-col gap-8 relative h-screen w-screen overflow-auto">
			<Header />
			<div class="md:p-4 border rounded-xl border-stone-300 shadow-lg flex flex-col justify-between  relative lg:mx-4 flex-grow overflow-hidden">
				<header class="flex justify-end py-4 sticky">
					<SettingsDropDownMenu
						onSaveBoard={(title) => {
							saveBoard({ title, url: window.location.href });
						}}
						onShareBoard={() => {
							try {
								navigator.clipboard.writeText(window.location.href);
								toaster.show((props) => (
									<Toast toastId={props.toastId}>
										<ToastContent>
											<ToastTitle>Url saved to Clipboard</ToastTitle>
										</ToastContent>
										<ToastProgress />
									</Toast>
								));
							} catch (error) {
								console.error(error);
							}
						}}
						onBoardSizeChange={(size) => {
							updateGrid(clearGrid(size.rows, size.cols));
							updateBoardSize(size);
						}}
					/>
				</header>
				<main
					onContextMenu={onContextMenu}
					class="flex flex-wrap overflow-auto contain-content gap-4 relative justify-center"
				>
					<For each={mazes()}>
						{(maze) => (
							<Maze
								ref={(handle) => setMazeRef(maze.id, handle)}
								sharedGrid={grid}
								header={
									<Button
										onClick={() => removeMaze(maze.id)}
										variant="destructive"
									>
										<AiOutlineDelete />
									</Button>
								}
								updateSharedGridCell={(row: number, col: number) => {
									if (
										Array.from(mazeRefs().values()).some(
											(maze) => maze.isRunning,
										)
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
				<footer class="py-4 flex justify-end gap-2">
					<Button
						class="rounded-md flex flex-row items-center gap-2 justify-center py-5 w-40"
						onClick={() =>
							updateGrid(clearGrid(boardSize().rows, boardSize().cols))
						}
						variant="destructive"
					>
						<AiOutlineClear /> Clear grids
					</Button>
					<Button
						class="rounded-md flex flex-row items-center gap-2 justify-center py-5 w-40"
						onClick={resetAllMazes}
						variant="outline"
						disabled={!startPoint() || !goalPoint()}
					>
						<VsDebugRestart /> Reset all
					</Button>
					<Button
						class="rounded-md flex flex-row items-center gap-2 justify-center py-5 w-40"
						onClick={runAllMazes}
						disabled={!startPoint() || !goalPoint()}
						variant="successful"
					>
						<VsRunAll /> Run all
					</Button>
				</footer>
			</div>
			<Footer />
		</div>
	);
}
