import { cn } from "~/libs/cn";
import {
	AlgorithmAborted,
	type AlgorithmProps,
	type Grid,
	type Position,
} from "~/libs/types";
import { maxMovePerSecond } from "~/libs/utils";
import { useSettingsStore } from "~/stores/settings-store";
import {
	type Accessor,
	createEffect,
	createSignal,
	type JSX,
	startTransition,
} from "solid-js";
import { Button } from "./ui/button";
import { VsDebugRestart, VsDebugStart } from "solid-icons/vs";
import { GridIn2D } from "./grid-in-2d";
import { GraphView } from "./grid-as-graph";

export interface GridRendererProps {
	grid: Accessor<Grid>;
	updateCell: (row: number, col: number) => void;
	finalPath: Accessor<Position[]>;
	classProp?: string;
}

interface GenericMazeProps {
	sharedGrid: Accessor<Grid>;
	updateSharedGridCell: (row: number, col: number) => void;
	algorithm: (props: AlgorithmProps) => Promise<Position[] | null>;
	algorithmName: string;
	startPoint: Accessor<Position | undefined>;
	goalPoint: Accessor<Position | undefined>;
	ref?: (handle: MazeHandle) => void;
	header?: JSX.Element;
}

export interface MazeHandle {
	start: () => Promise<void>;
	restart: () => void;
	isRunning: boolean;
}

export function Maze(props: GenericMazeProps) {
	const [grid, setGrid] = createSignal<Grid>(props.sharedGrid());
	const [visitedOrder, setVisitedOrder] = createSignal<Position[]>([]);
	const [isRunning, setIsRunning] = createSignal(false);
	const [finalPath, setFinalPath] = createSignal<Position[]>([]);
	const pathFound = finalPath()?.length > 0;
	const { state } = useSettingsStore();

	const movesPerSecondRef = { current: null } as { current: number | null };
	const abortControllerRef = { current: null } as {
		current: AbortController | null;
	};

	createEffect(() => {
		movesPerSecondRef.current = state.movesPerSecond;
	});

	const initializeGrid = (grid: Grid) => {
		setGrid(grid.map((row) => [...row]));
		setVisitedOrder([]);
		setFinalPath([]);
	};

	createEffect(() => {
		initializeGrid(props.sharedGrid());
	});

	const updateCell = async (x: number, y: number, value: number) => {
		if (abortControllerRef.current?.signal.aborted) {
			throw new AlgorithmAborted("Algorithm aborted");
		}
		startTransition(() => {
			setGrid((prev) => {
				const newGrid = [...prev.map((row) => [...row])];
				if (newGrid[x][y] === 0) newGrid[x][y] = value;
				return newGrid;
			});
			setVisitedOrder((prev) => [...prev, [x, y]]);
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
		if (!start || !goal) return;
		if (pathFound) initializeGrid(props.sharedGrid());
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
				grid: grid(),
				updateCell,
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
		initializeGrid(props.sharedGrid());
	};

	// Set up ref handle
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
		<div class="lg:p-4 p-2 flex flex-col h-full gap-2 border rounded flex-1">
			<header class="flex justify-between md:min-h-16 gap-2 lg:gap-4">
				<h2 class="text-lg text-pretty">Algorithm: {props.algorithmName}</h2>
				<div class="space-x-2 shrink-0">
					<GraphView
						grid={grid}
						startPoint={props.startPoint}
						updateCell={props.updateSharedGridCell}
					/>
					{props.header}
				</div>
			</header>
			<main class="mb-4 flex-grow overflow-auto">
				<GridIn2D
					grid={grid}
					finalPath={finalPath}
					updateCell={props.updateSharedGridCell}
					classProp={cn(
						isRunning() ? "transition-colors duration-500 ease-in-out" : "",
					)}
				/>
			</main>
			<footer
				class={cn("grid transition-all duration-300 ease-in-out relative")}
			>
				<div class="overflow-hidden w-3/4 relative">
					<div
						class={cn(
							"transition-all duration-300 ease-in-out",
							pathFound ? "h-20 opacity-100" : "h-0 opacity-0",
						)}
					>
						<p class="mt-2 font-normal w-full break-words text-pretty">
							{finalPath().length > 0
								? `Goal reached! Final path takes ${finalPath().length - 1} steps. Algorithm visited ${visitedOrder().length} cells in the precess of finding the goal.`
								: null}
						</p>
					</div>
				</div>
				<div class="flex justify-end gap-2 p-4">
					<Button
						onClick={startAlgorithm}
						type="button"
						disabled={!props.startPoint() || !props.goalPoint() || isRunning()}
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
