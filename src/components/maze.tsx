import { cn } from "~/libs/cn";
import {
	AlgorithmAborted,
	BlockType,
	type AlgorithmProps,
	type Grid,
	type Position,
} from "~/libs/types";
import { maxMovePerSecond } from "~/libs/utils";
import { useSettingsStore } from "~/stores/settings-store";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	startTransition,
} from "solid-js";
import { Button } from "./ui/button";
import { VsDebugRestart, VsDebugStart } from "solid-icons/vs";
import { GridIn2D } from "./grid-in-2d";
import { GraphView } from "./grid-as-graph";
import { AiOutlineDelete } from "solid-icons/ai";
import { showGenericToast } from "./generic-toast";

interface GenericMazeProps {
	sharedGrid: Accessor<Grid>;
	updateSharedGridCell: (row: number, col: number) => void;
	algorithm: (props: AlgorithmProps) => Promise<Position[] | null>;
	algorithmName: string;
	startPoint: Accessor<Position | undefined>;
	goalPoint: Accessor<Position | undefined>;
	removeMaze: () => void;
	ref?: (handle: MazeHandle) => void;
}

export interface MazeHandle {
	start: () => Promise<void>;
	restart: () => void;
	isRunning: boolean;
}

export function Maze(props: GenericMazeProps) {
	const [visitedOrder, setVisitedOrder] = createSignal<Position[]>([]);
	const [isRunning, setIsRunning] = createSignal(false);
	const [finalPath, setFinalPath] = createSignal<Position[]>([]);
	const finalPathFound = () => finalPath().length > 0;
	const finalPathCost = createMemo(() => {
		if (!finalPathFound) return "0";
		return finalPath()
			.reduce((acc, cell) => {
				const cellValue = props.sharedGrid().at(cell[0])?.at(cell[1]);
				return cellValue &&
					cellValue !== BlockType.START &&
					cellValue !== BlockType.GOAL
					? acc + cellValue - BlockType.TERRAIN_EASY + 1
					: acc;
			}, 0)
			.toString();
	});
	const { state } = useSettingsStore();

	const movesPerSecondRef = { current: null } as { current: number | null };
	const abortControllerRef = { current: null } as {
		current: AbortController | null;
	};

	createEffect(() => {
		movesPerSecondRef.current = state.movesPerSecond;
	});

	createEffect(() => {
		props.sharedGrid();
		resetMaze();
		setFinalPath([]);
	});

	const resetMaze = () => {
		setVisitedOrder([]);
		setFinalPath([]);
	};

	const markCellAsVisited = async (row: number, col: number) => {
		if (abortControllerRef.current?.signal.aborted) {
			throw new AlgorithmAborted("Algorithm aborted");
		}
		startTransition(() => {
			const cell = props.sharedGrid()[row][col];
			if (cell !== BlockType.START && cell !== BlockType.GOAL) {
				setVisitedOrder((prev) => [...prev, [row, col]]);
			}
		});

		if (movesPerSecondRef.current !== maxMovePerSecond) {
			await new Promise((resolve) =>
				setTimeout(resolve, 1000 / movesPerSecondRef.current!),
			);
		}
	};

	const startAlgorithm = async () => {
		const start = props.startPoint();
		const goal = props.goalPoint();
		if (!start) {
			return showGenericToast("Cannot start, the start point is missing", "destructive")
		}
		if (!goal) {
			return showGenericToast("Cannot start, the goal point is missing", "destructive")
		}
		if (finalPathFound()) resetMaze();
		setIsRunning(true);
		abortControllerRef.current = new AbortController();
		const rows = props.sharedGrid().length!;
		const cols = props.sharedGrid()[0]!.length;

		try {
			const result = await props.algorithm({
				start,
				goal,
				rows,
				cols,
				grid: props.sharedGrid(),
				markCellAsVisited,
			});

			if (result) {
				setFinalPath(result);
			}
		} catch (error) {
			if (error instanceof AlgorithmAborted) {
				console.log("Algorithm execution was aborted");
			} else {
				console.error("An error occurred during algorithm execution:", error);
			}
		}
		setIsRunning(false);
	};

	const restartAlgorithm = () => {
		abortControllerRef.current?.abort();
		resetMaze();
	};

	createEffect(() => {
		if (props.ref) {
			props.ref({
				start: startAlgorithm,
				restart: restartAlgorithm,
				isRunning: isRunning(),
			});
		}
	});

	return (
		<div class="lg:p-4 py-4 flex flex-col gap-2 border rounded min-w-96">
			<header class="flex justify-between md:min-h-16 gap-2 lg:gap-4 @container">
				<h1 class="md:text-lg text-pretty w-80 @md:w-fit">
					Algorithm: {props.algorithmName}
				</h1>
				<div class="space-x-2 shrink-0">
					<GraphView
						grid={props.sharedGrid}
						startPoint={props.startPoint}
						updateCell={props.updateSharedGridCell}
					/>
					<Button onClick={props.removeMaze} variant="destructive">
						<AiOutlineDelete />
					</Button>
				</div>
			</header>
			<GridIn2D
				grid={props.sharedGrid}
				visitedCells={visitedOrder}
				finalPath={finalPath}
				updateCell={props.updateSharedGridCell}
				isRunning={isRunning}
			/>
			<footer class="flex transition-all duration-300 ease-in-out relative mt-4 justify-between">
				<div
					class={cn(
						"mt-2 font-normal w-96 break-words text-pretty transition-opacity ease-in-out",
						finalPathFound()
							? "opacity-100 duration-300"
							: "opacity-0 duration-0",
					)}
				>
					<p>Goal reached!</p>
					<p class="break-words text-pretty">
						Final path takes {finalPath().length - 2} steps and the cost is{" "}
						{finalPathCost()}.
					</p>
					<p class="break-words text-pretty">
						Algorithm visited {visitedOrder().length} cells in the precess of
						finding the goal.
					</p>
				</div>
				<div class="flex mt-auto gap-2">
					<Button
						classList={{ "opacity-75": !props.goalPoint() || !props.startPoint()}}
						onClick={startAlgorithm}
						type="button"
						disabled={isRunning()}
						variant={isRunning() ? "destructive" : "successful"}
					>
						<VsDebugStart />
					</Button>
					<Button
						onClick={restartAlgorithm}
						type="button"
						disabled={!props.startPoint() || !props.goalPoint()}
						variant="destructive"
					>
						<VsDebugRestart />
					</Button>
				</div>
			</footer>
		</div>
	);
}
