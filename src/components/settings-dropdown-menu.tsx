import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
} from "~/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "./ui/button";
import { useSettingsStore } from "~/stores/settings-store";
import type { Algo, BoardSize } from "~/libs/types";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import {
	algoTypeToTitle,
	boardSizes,
	maxMovePerSecond,
	minMovePerSecond,
} from "~/libs/utils";
import { For, createSignal } from "solid-js";
import { useUrlState } from "~/hooks/useUrlState";
import { BsThreeDots } from 'solid-icons/bs'
import { AiOutlineDelete } from 'solid-icons/ai'

export function SettingsDropDownMenu({
	onBoardSizeChange,
	onShareBoard,
	onSaveBoard,
}: {
	onShareBoard: () => void;
	onSaveBoard: (title: string) => void;
	onBoardSizeChange: (size: BoardSize) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<BsThreeDots />
			</DropdownMenuTrigger>
			<DropdownMenuContent class="min-w-64">
				<DropdownMenuGroup>
					<DropdownMenuGroupLabel>Settings</DropdownMenuGroupLabel>
					<DropdownMenuSeparator />
					<MovesPerSecondMenuItem />
					<DropdownMenuItem onSelect={onShareBoard}>
						Share board
					</DropdownMenuItem>
					<SaveBoardMenuItem onSaveBoard={onSaveBoard} />
					<SavedBoardsSubMenu />
					<AddAlgorithmSubMenu />
					<ChangeBoardSizeSubMenu onChange={onBoardSizeChange} />
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SaveBoardMenuItem({
	onSaveBoard,
}: {
	onSaveBoard: (title: string) => void;
}) {
	const [title, setTitle] = createSignal("");
	const [dialogOpen, setDialogOpen] = createSignal(false);

	return (
		<Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
			<DialogTrigger
				as={(props: DialogTriggerProps) => (
					<DropdownMenuItem onSelect={(e) => e.preventDefault()} {...props}>
						Save board
					</DropdownMenuItem>
				)}
			/>
			<DialogContent class="sm:max-w-[425px]">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSaveBoard(title());
						setTitle("");
						setDialogOpen(false);
					}}
				>
					<DialogHeader>
						<DialogTitle>Save board</DialogTitle>
					</DialogHeader>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<label for="title" class="text-right">
								Title
							</label>
							<input
								id="title"
								class="col-span-3"
								onChange={(e) => setTitle(e.target.value)}
								value={title()}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Save</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function SavedBoardsSubMenu() {
	const { state, deleteBoard } = useSettingsStore();
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<span>Saved Boards</span>
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				{state.savedBoards.length > 0 ? (
					<For each={state.savedBoards}>
						{(board) => (
							<DropdownMenuItem
								key={board.id}
								class="flex gap-2"
								onSelect={(e) => e.preventDefault()}
							>
								<button
									class="flex-1 text-start"
									type="button"
									onClick={() => {
										window.location.replace(board.url);
									}}
								>
									{board.title}
								</button>
								<Button
									variant="destructive"
									onClick={() => {
										deleteBoard(board.id);
									}}
								>
									<AiOutlineDelete />
								</Button>
							</DropdownMenuItem>
						)}
					</For>
				) : (
					<DropdownMenuItem>Empty</DropdownMenuItem>
				)}
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

function MovesPerSecondMenuItem() {
	const { state, updateMovesPerSecond } = useSettingsStore();
	return (
		<DropdownMenuItem class="flex flex-col gap-2">
			<span class="w-full">
				{`Speed: ${minMovePerSecond === state.movesPerSecond ? "Slowest" : state.movesPerSecond <= 6 ? "Slow" : state.movesPerSecond <= 12 ? "Normal" : state.movesPerSecond === maxMovePerSecond ? "Instant (No animation)" : "Fast"}`}
			</span>
			<input
				type="range"
				min={minMovePerSecond}
				max={maxMovePerSecond}
				step={1}
				value={state.movesPerSecond}
				onChange={(e) =>
					updateMovesPerSecond(e.target.valueAsNumber || minMovePerSecond)
				}
				class="w-full"
			/>
		</DropdownMenuItem>
	);
}

function AddAlgorithmSubMenu() {
	const { addMaze } = useSettingsStore();
	const algos = ["Astar", "DFS", "BFS", "BI"] satisfies Algo[];

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<span>Add algorithm</span>
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<For each={algos}>
					{(algo) => (
						<DropdownMenuItem onSelect={() => addMaze(algo)}>
							<span>{algoTypeToTitle[algo]}</span>
						</DropdownMenuItem>
					)}
				</For>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

function ChangeBoardSizeSubMenu({
	onChange,
}: { onChange: (size: BoardSize) => void }) {
	const { boardSize } = useUrlState();
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<span>Change size</span>
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<For each={boardSizes}>
					{(size) => (
						<DropdownMenuItem onSelect={() => onChange(size)}>
							<span>
								{size.type} {size.type === boardSize().type ? "(Current)" : ""}
							</span>
						</DropdownMenuItem>
					)}
				</For>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
