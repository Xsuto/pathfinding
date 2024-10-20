// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { AppHeader } from "~/components/app-header";
import { AppFooter } from "~/components/app-footer";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<title>Pathfinding app</title>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
					<link
						href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
						rel="stylesheet"
					/>
					{assets}
				</head>
				<body class="bg-primaryBackground text-primaryText min-h-screen h-screen w-screen relative font-mono">
					<div
						id="app"
						class="flex flex-col gap-8 relative overflow-auto"
					>
						<AppHeader />
						{children}
						<AppFooter />
					</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
