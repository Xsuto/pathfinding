// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<title>Pathfinding app</title>
					{assets}
				</head>
				<body class="bg-primaryBackground text-primaryText min-h-screen h-screen w-screen relative">
					<div
						id="app"
						class="flex flex-col gap-8 relative overflow-auto font-mono"
					>
						{children}
					</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
