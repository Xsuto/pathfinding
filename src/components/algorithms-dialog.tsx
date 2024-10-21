import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from "./ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Button } from "./ui/button";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { useUrlState } from "~/hooks/useUrlState";
import { For } from "solid-js";
import { algoTypeToTitle } from "~/libs/utils";
import {
	AiOutlineArrowDown,
	AiOutlineArrowUp,
	AiOutlineDelete,
} from "solid-icons/ai";
import type { Algo } from "~/libs/types";
import {
	DragDropProvider,
	DragDropSensors,
	useDragDropContext,
	createDraggable,
	createDroppable,
} from "@thisbeyond/solid-dnd";

function AlgorithmIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
		>
			<g
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width={1.5}
				color="currentColor"
			>
				<path d="M10.5 2v2m3-2v2M8 6.5H6m2 3H6m12-3h-2m2 3h-2M13.333 4h-2.666C9.41 4 8.78 4 8.39 4.39C8 4.782 8 5.41 8 6.668v2.666c0 1.257 0 1.886.39 2.277c.391.39 1.02.39 2.277.39h2.666c1.257 0 1.886 0 2.277-.39c.39-.391.39-1.02.39-2.277V6.667c0-1.257 0-1.886-.39-2.276C15.219 4 14.59 4 13.333 4M3.617 21.924c.184.076.417.076.883.076s.699 0 .883-.076a1 1 0 0 0 .54-.541C6 21.199 6 20.966 6 20.5s0-.699-.076-.883a1 1 0 0 0-.541-.54C5.199 19 4.966 19 4.5 19s-.699 0-.883.076a1 1 0 0 0-.54.541C3 19.801 3 20.034 3 20.5s0 .699.076.883a1 1 0 0 0 .541.54m7.5.001c.184.076.417.076.883.076s.699 0 .883-.076a1 1 0 0 0 .54-.541c.077-.184.077-.417.077-.883s0-.699-.076-.883a1 1 0 0 0-.541-.54C12.699 19 12.466 19 12 19s-.699 0-.883.076a1 1 0 0 0-.54.541c-.077.184-.077.417-.077.883s0 .699.076.883a1 1 0 0 0 .541.54M12 19v-7" />
				<path d="M4.5 19c0-1.404 0-2.107.337-2.611a2 2 0 0 1 .552-.552C5.893 15.5 6.596 15.5 8 15.5h8c1.404 0 2.107 0 2.611.337c.218.146.406.334.552.552c.337.504.337 1.207.337 2.611m-.883 2.924c.184.076.417.076.883.076s.699 0 .883-.076a1 1 0 0 0 .54-.541c.077-.184.077-.417.077-.883s0-.699-.076-.883a1 1 0 0 0-.541-.54C20.199 19 19.966 19 19.5 19s-.699 0-.883.076a1 1 0 0 0-.54.541c-.077.184-.077.417-.077.883s0 .699.076.883a1 1 0 0 0 .541.54" />
			</g>
		</svg>
	);
}

export function AlgorithmsDialog() {
	const { algorithms, removeAlgorithm, addAlgorithm, setAlgorithms } =
		useUrlState();
	return (
		<Dialog>
			<DialogTrigger
				as={(props: DialogTriggerProps) => (
					<Button variant="outline" class="space-x-2" {...props}>
						<AlgorithmIcon />
						<span class="hidden md:block">Algorithms</span>
					</Button>
				)}
			/>
			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Algorithms</DialogTitle>
					<DialogDescription>Add and manage algorithms.</DialogDescription>
				</DialogHeader>
				<div class="mt-4 space-y-4">
					<div class="flex items-center space-x-2">
						<Select
							class="w-full"
							value={null}
							placeholder="Add algorithm"
							onChange={(algo) => algo && addAlgorithm(algo as Algo)}
							options={Object.keys(algoTypeToTitle)}
							itemComponent={(props) => (
								<SelectItem item={props.item}>{algoTypeToTitle[props.item.rawValue as Algo]}</SelectItem>)}
						>
							<SelectTrigger>
								<SelectValue<string>>
									{(state) => state.selectedOption()}
								</SelectValue>
							</SelectTrigger>
							<SelectContent />
						</Select>
					</div>
					<div class="space-y-2">
						<For each={algorithms()}>
							{(algorithm) => {
								return (
									<div class="flex items-center justify-between bg-secondary p-3 rounded-md">
										<div>
											<h3 class="font-semibold">
												{algoTypeToTitle[algorithm.type]}
											</h3>
											<p class="text-sm text-muted-foreground">TODO</p>
										</div>
										<div class="space-x-2">
											<Button
												variant="outline"
												size="icon"
												onClick={() => {
													const idx = algorithms().findIndex(
														(it) => it.id === algorithm.id,
													);
													if (idx <= 0) return;
													const newOrder = algorithms();
													[newOrder[idx], newOrder[idx - 1]] = [
														newOrder[idx - 1],
														newOrder[idx],
													];
													setAlgorithms(newOrder.map((it) => it.type));
												}}
											>
												<AiOutlineArrowUp />
											</Button>
											<Button
												variant="outline"
												size="icon"
												onClick={() => {
													const idx = algorithms().findIndex(
														(it) => it.id === algorithm.id,
													);
													if (idx === algorithms().length - 1) return;
													const newOrder = algorithms();
													[newOrder[idx], newOrder[idx + 1]] = [
														newOrder[idx + 1],
														newOrder[idx],
													];
													setAlgorithms(newOrder.map((it) => it.type));
												}}
											>
												<AiOutlineArrowDown />
											</Button>
											<Button
												variant="outline"
												size="icon"
												onClick={() => {
													removeAlgorithm(algorithm.id);
												}}
											>
												<AiOutlineDelete />
											</Button>
										</div>
									</div>
								);
							}}
						</For>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
