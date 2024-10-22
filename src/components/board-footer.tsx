import { AiOutlineClear } from "solid-icons/ai";
import { VsDebugRestart, VsRunAll } from "solid-icons/vs";
import { cn } from "~/libs/cn";
import { showGenericToast } from "./generic-toast";
import { Button } from "./ui/button";

export function BoardFooter({
  clearGrid,
  runAllMazes,
  resetAllMazes,
  hasStartPoint,
  hasGoalPoint,
}: {
  clearGrid: () => void;
  hasStartPoint: () => boolean;
  hasGoalPoint: () => boolean;
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
        class={cn(
          "rounded-md flex flex-row items-center gap-2 justify-center py-5 w-40",
          !(hasStartPoint() || hasGoalPoint()) && "opacity-75",
        )}
        onClick={() => {
          if (!hasStartPoint()) {
            return showGenericToast(
              "Cannot start, the start point is missing",
              "destructive",
            );
          }
          if (!hasGoalPoint()) {
            return showGenericToast(
              "Cannot start, the goal point is missing",
              "destructive",
            );
          }
          runAllMazes();
        }}
        variant="successful"
      >
        <VsRunAll />
        <span class="hidden md:block">Run all</span>
      </Button>
    </footer>
  );
}
