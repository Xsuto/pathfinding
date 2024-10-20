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
	const finalPathFound = () => finalPath().length > 0;
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
		if (finalPathFound()) initializeGrid(props.sharedGrid());
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
		<div class="lg:p-4 flex flex-col gap-2 border rounded min-w-96">
			<header class="flex justify-between md:min-h-16 gap-2 lg:gap-4">
				<h1 class="md:text-lg text-pretty w-80">
					Algorithm: {props.algorithmName}
				</h1>
				<div class="space-x-2 shrink-0">
					<GraphView
						grid={grid}
						startPoint={props.startPoint}
						updateCell={props.updateSharedGridCell}
					/>
					{props.header}
				</div>
			</header>
			<GridIn2D
				grid={grid}
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
					<p>Final path takes {finalPath().length - 1} steps.</p>
					<p class="break-words text-pretty">
						Algorithm visited {visitedOrder().length} cells in the precess of
						finding the goal.
					</p>
				</div>
				<div class="flex mt-auto gap-2">
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
