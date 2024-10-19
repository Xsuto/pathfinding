import { Header } from "~/components/Header";
import { SettingsDropDownMenu } from "~/components/settings-dropdown-menu";
import { Button } from "~/components/ui/button";
import { ContextMenu, useContextMenu } from "~/components/context-menu";
import { BlockType, type Position, type Grid } from "~/libs/types";
import { algoTypeToFunc, algoTypeToTitle, clearGrid, findBlockTypeInGrid } from "~/libs/utils";
import { useSettingsStore } from "~/stores/settings-store";
import { Icon } from '@iconify-icon/solid';
import { For, createMemo, createSignal, startTransition } from "solid-js";
import { toaster } from "@kobalte/core";
import {
	Toast,
	ToastContent,
	ToastProgress,
	ToastTitle
} from "~/components/ui/toast";
import { Footer } from "~/components/Footer";
import { Maze, type MazeHandle } from "~/components/maze";


export default function Home() {
	const { state, saveBoard, updateBoardSize, removeMaze } = useSettingsStore()
	const [grid, setGrid] = createSignal<Grid>(clearGrid(state.boardSize.rows, state.boardSize.cols))

	const startPoint = createMemo<Position | undefined>(
		() => findBlockTypeInGrid(grid(), BlockType.START),
	);

	const goalPoint = createMemo<Position | undefined>(
		() => findBlockTypeInGrid(grid(), BlockType.GOAL),
	);

	const [mazeRefs, setMazeRefs] = createSignal<Record<string, MazeHandle>>({});

	const mazes = createMemo(
		() =>
			state.mazes.map((it) => ({
				...it,
				algo: algoTypeToFunc[it.type],
				ref: { current: null } as { current: null | MazeHandle },
			})),
	);

	const { onContextMenu, isOpen, onClickOutside, position } = useContextMenu();

	const runAllMazes = async () => {
    const refs = mazeRefs();
    const promises = Object.values(refs)
      .filter((maze) => !maze.isRunning)
      .map((maze) => maze.start());
    await Promise.all(promises);
  };

	const resetAllMazes = async () => {
    const refs = mazeRefs();
    const promises = Object.values(refs)
      .filter((maze) => !maze.isRunning)
      .map((maze) => maze.restart());
    await Promise.all(promises);
  };

	return (
		<div class="flex flex-col gap-8 relative h-screen w-screen overflow-auto">
			<Header />
			<div class="p-4 border rounded-xl border-stone-300 shadow-lg flex flex-col justify-between  relative mx-2 lg:mx-4 flex-grow overflow-hidden">
				<header class="flex justify-end py-4 sticky">
					<SettingsDropDownMenu
						onSaveBoard={(title) => {
							const fullURL = `${window.location.protocol}//${window.location.host}${location.pathname}${location.hash}?boardSizeType=${state.boardSize.type}&grid=${grid().map((row) => row.join("")).join("-")}`;
							saveBoard({ title, url: fullURL });
						}}
						onShareBoard={() => {
							const fullURL = `${window.location.protocol}//${window.location.host}${location.pathname}${location.hash}?boardSizeType=${state.boardSize.type}&grid=${grid().map((row) => row.join("")).join("-")}`;
							try {
								navigator.clipboard.writeText(fullURL);
								toaster.show(props => (
									<Toast toastId={props.toastId}>
										<ToastContent>
											<ToastTitle>Url saved to Clipboard</ToastTitle>
										</ToastContent>
										<ToastProgress />
									</Toast>
								))

							} catch (error) {}
						}}
						onBoardSizeChange={(size) => {
							setGrid(clearGrid(size.rows, size.cols));
							updateBoardSize(size);
						}}
					/>
				</header>
					<main
						onContextMenu={onContextMenu}
						class="flex flex-wrap overflow-auto contain-content gap-4 relative"
						// NOTE: we might need a key here
					>
						<For each={mazes()}>
							{(maze) => 
								<Maze
									ref={(handle) => {
										setMazeRefs(prev => ({...prev, [maze.id]: handle}));
									}}
									sharedGrid={grid}
									header={
										<Button
											onClick={() => removeMaze(maze.id)}
											variant="destructive"
										>
											<Icon icon="material-symbols:delete-outline" />
										</Button>
									}
									updateSharedGridCell={(row: number, col: number) => {
										if (mazes().some((maze) => maze.ref?.current?.isRunning)) return;
										startTransition(() => {
											setGrid((prev) =>
												prev.map((value, i) =>
													value.map((val, j) => {
														if (
															state.paintMode === BlockType.GOAL ||
																state.paintMode === BlockType.START
														) {
															return i === row && j === col
																? state.paintMode
																: val === state.paintMode
																	? BlockType.EMPTY
																	: val;
														}
														return i === row && j === col ? state.paintMode : val;
													}),
												),
											);
										});
									}}
									algorithm={maze.algo}
									algorithmName={algoTypeToTitle[maze.type]}
									startPoint={startPoint}
									goalPoint={goalPoint}
								/>
							}
						</For>
					</main>
				<ContextMenu onClickOutside={onClickOutside} isOpen={isOpen} position={position} onContextMenu={onContextMenu}/>
				<footer class="py-4 flex justify-end gap-2">
					<Button
						class="rounded-full flex flex-row items-center gap-2 justify-center py-5 w-36"
						onClick={() => setGrid(clearGrid(state.boardSize.rows, state.boardSize.cols))}
						variant="destructive"
					>
						<Icon icon="ant-design:clear-outlined" /> Clear grids
					</Button>
					<Button
						class="rounded-full flex flex-row items-center gap-2 justify-center py-5 w-32"
						onClick={resetAllMazes}
						variant="outline"
						disabled={!startPoint || !goalPoint}
					>
            <Icon icon="solar:restart-linear" /> Reset all
					</Button>
					<Button
						class="rounded-full flex flex-row items-center gap-2 justify-center py-5 w-32"
						onClick={runAllMazes}
						disabled={!startPoint || !goalPoint}
						variant="successful"
					>
						<Icon icon="codicon:run-all" /> Run all
					</Button>
				</footer>
			</div>
			<Footer />
		</div>
	);
}
