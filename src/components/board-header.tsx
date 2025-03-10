import { FiShare } from "solid-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUrlState } from "~/hooks/useUrlState";
import { clearGrid, paintModes } from "~/libs/utils";
import { useSettingsStore } from "~/stores/settings-store";
import { AlgorithmsDialog } from "./algorithms-dialog";
import { showGenericToast } from "./generic-toast";
import { SaveBoardDialog } from "./save-board-dialog";
import { SettingsDropDownMenu } from "./settings-dropdown-menu";
import { Button } from "./ui/button";

export function BoardHeader({
  isBoardRunning,
}: { isBoardRunning: () => boolean }) {
  const { updateGrid, updateBoardSize } = useUrlState();
  const { state, saveBoard, updatePaintMode } = useSettingsStore();

  const onSaveBoard = (title: string) => {
    saveBoard({ title, url: window.location.href });
  };

  const onShareBoard = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      showGenericToast("Url saved to clipboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header class="flex justify-around md:justify-end gap-2 md:gap-4 py-4 sticky">
      <AlgorithmsDialog />
      <Select
        class="w-44 lg:w-52"
        value={paintModes.find((it) => it.type === state.paintMode)}
        options={paintModes}
        onChange={(e) => e && updatePaintMode(e?.type)}
        optionValue="type"
        optionTextValue="label"
        itemComponent={(props) => (
          <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>
        )}
      >
        <SelectTrigger>
          <SelectValue<(typeof paintModes)[number]> class="text-xs md:text-sm">
            {(state) => `Paint: ${state.selectedOption().label}`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
      <SaveBoardDialog onSaveBoard={onSaveBoard} />
      <Button variant="outline" class="space-x-2" onClick={onShareBoard}>
        <FiShare />
        <span class="hidden md:block">Share</span>
      </Button>

      <SettingsDropDownMenu
        onBoardSizeChange={(size) => {
          if (isBoardRunning()) return;
          updateGrid(clearGrid(size.rows, size.cols));
          updateBoardSize(size);
        }}
      />
    </header>
  );
}
