import AboutDialog from "./about-dialog";

function LogoIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 16 16"
			class="size-6"
		>
			<path
				fill="none"
				stroke="currentColor"
				d="M6 11.25h6a2 2 0 1 0 0-4H5a2 2 0 1 1 0-4h3.242M4.5 10a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3ZM10 2a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z"
			/>
		</svg>
	);
}

export function AppHeader() {
	return (
		<header class="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
			<h1 class="flex items-center gap-2">
				<LogoIcon />
				<span class="text-lg font-semibold">Pathfinding Visualizer</span>
			</h1>
			<nav class="flex items-center gap-4" >
				<AboutDialog />
			</nav>
		</header>
	);
}
