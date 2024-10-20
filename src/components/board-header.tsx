import { useUrlState } from "~/hooks/useUrlState";
import { useSettingsStore } from "~/stores/settings-store";
import { Toast, ToastContent, ToastProgress, ToastTitle } from "./ui/toast";
import { SaveBoardDialog } from "./save-board-dialog";
import { Button } from "./ui/button";
import { FiShare } from "solid-icons/fi";
import { SettingsDropDownMenu } from "./settings-dropdown-menu";
import { clearGrid, paintModes } from "~/libs/utils";
import { toaster } from "@kobalte/core";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

export function BoardHeader() {
	const { updateGrid, updateBoardSize } = useUrlState();
	const { state, saveBoard, updatePaintMode } = useSettingsStore();

	const onSaveBoard = (title: string) => {
		saveBoard({ title, url: window.location.href });
	};

	const onShareBoard = () => {
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
	};

	return (
		<header class="flex justify-end gap-2 md:gap-4 py-4 sticky">
			<Select
				class="w-52"
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
					<SelectValue<(typeof paintModes)[number]>>
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
					updateGrid(clearGrid(size.rows, size.cols));
					updateBoardSize(size);
				}}
			/>
		</header>
	);
}
