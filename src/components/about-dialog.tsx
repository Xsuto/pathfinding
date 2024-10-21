import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { TbBadge, TbBrain, TbCode, TbRoute } from "solid-icons/tb";
import { BlockType } from "~/libs/types";
import { getTerrainCost } from "~/libs/algos";
import { createSignal, onMount } from "solid-js";

export default function AboutDialog() {
	const [open, setOpen] = createSignal(false);
	onMount(() => {
		setOpen(!localStorage.getItem("did-see-about-project-dialog"));
	});

	return (
		<Dialog
			open={open()}
			onOpenChange={(state) => {
				if (!state && !localStorage.getItem("did-see-about-project-dialog")) {
					localStorage.setItem("did-see-about-project-dialog", "true");
				}
				setOpen(state);
			}}
		>
			<DialogTrigger
				as={(props: DialogTriggerProps) => (
					<Button
						variant="outline"
						size="none"
						class="gap-2 hover:bg-primary/10 rounded-lg p-2 w-40"
						{...props}
					>
						<TbBadge class="w-4 h-4" />
						About Project
					</Button>
				)}
			/>
			<DialogContent class="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle class="flex items-center gap-3 lg:text-2xl font-bold">
						<TbRoute class="w-7 h-7 text-primary hidden lg:block" />
						Pathfinding Algorithm Visualizer
					</DialogTitle>
					<DialogDescription class="text-base flex items-center gap-2">
						<span class="font-medium text-primary">
							Engineering Diploma Project
							<span class="text-muted-foreground"> by Michał Sutowicz</span>
						</span>
					</DialogDescription>
				</DialogHeader>

				<div class="space-y-6 pt-4">
					<section class="space-y-3 rounded-lg border p-4 bg-card">
						<div class="flex items-center gap-2">
							<TbBrain class="w-5 h-5 text-primary" />
							<h3 class="text-lg font-semibold">Project Overview</h3>
						</div>
						<p class="text-muted-foreground leading-relaxed">
							A web application designed to visually demonstrate various
							pathfinding algorithms, providing an interactive and educational
							platform for understanding how different pathfinding techniques
							work in real-time.
						</p>
					</section>

					<section class="space-y-3 rounded-lg border p-4 bg-card">
						<div class="flex items-center gap-2">
							<h3 class="text-lg font-semibold">How to Use</h3>
						</div>
						<div class="space-y-3 text-muted-foreground">
							<p class="leading-relaxed">
								1. Click on algorithms button to add/remove algorithms from the
								boards.
							</p>
							<p class="leading-relaxed">
								2. Choose paint mode via right-click context menu or the board's
								top-right corner paint mode selector.
							</p>
							<p class="leading-relaxed">
								3. Use left mouse button to paint on mazes. Start and goal nodes
								are required to run algorithms.
							</p>
							<div class="pt-2">
								<p class="font-medium text-foreground">Terrain Costs:</p>
								<ul class="list-inside space-y-1 pt-2">
									<li>
										• Easy Terrain: {getTerrainCost(BlockType.TERRAIN_EASY)}
									</li>
									<li>
										• Medium Terrain: {getTerrainCost(BlockType.TERRAIN_MEDIUM)}
									</li>
									<li>
										• Hard Terrain: {getTerrainCost(BlockType.TERRAIN_HARD)}
									</li>
								</ul>
								<p class="pt-2 text-sm italic">
									Note: Walls are impassable. Final path cost is the sum of all
									node costs in the path.
								</p>
							</div>
						</div>
					</section>

					<section class="space-y-3 rounded-lg border p-4 bg-card">
						<div class="flex items-center gap-2">
							<TbCode class="w-5 h-5 text-primary" />
							<h3 class="text-lg font-semibold">Technical Stack</h3>
						</div>
						<ul class="list-inside space-y-2 text-muted-foreground">
							<li class="flex items-center gap-2">
								<span>
									• Frontend:{" "}
									<span class="text-primary font-medium">
										Solid.js + Solid-start
									</span>
								</span>
							</li>
							<li class="flex items-center gap-2">
								<span>
									• Language:{" "}
									<span class="text-primary font-medium">TypeScript</span>
								</span>
							</li>
							<li class="flex items-center gap-2">
								<span>
									• Styling:{" "}
									<span class="text-primary font-medium">Tailwind CSS</span>
								</span>
							</li>
						</ul>
					</section>
				</div>
			</DialogContent>
		</Dialog>
	);
}
