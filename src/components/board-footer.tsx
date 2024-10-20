import { VsDebugRestart, VsRunAll } from "solid-icons/vs";
import { Button } from "./ui/button";
import { AiOutlineClear } from "solid-icons/ai";

export function BoardFooter({
	clearGrid,
	runAllMazes,
	resetAllMazes,
	canStartMazes,
}: {
	clearGrid: () => void;
	canStartMazes: () => boolean;
	runAllMazes: () => void;
	resetAllMazes: () => void;
}) {
	return (
		<footer class="py-4 flex justify-end gap-2">
			<Button
				class="rounded-md flex flex-row items-center gap-2 justify-center py-5 w-40"
				onClick={clearGrid}
				variant="destructive"
			>
				<AiOutlineClear />
				<span class="hidden md:block">Clear mazes</span>
			</Button>
			<Button
				class="rounded-md flex flex-row items-center gap-2 justify-center py-5 w-40"
				onClick={resetAllMazes}
				variant="outline"
			>
				<VsDebugRestart />
				<span class="hidden md:block">Reset all</span>
			</Button>
			<Button
				class="rounded-md flex flex-row items-center gap-2 justify-center py-5 w-40"
				onClick={runAllMazes}
				disabled={!canStartMazes()}
				variant="successful"
			>
				<VsRunAll />
				<span class="hidden md:block">Run all</span>
			</Button>
		</footer>
	);
}
