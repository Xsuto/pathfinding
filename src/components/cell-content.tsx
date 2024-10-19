import { Switch, Match } from "solid-js";
import { BlockType, type Position } from "~/libs/types";
import type { Accessor } from "solid-js";
import { OcGoal3 } from "solid-icons/oc";
import { BsBricks } from "solid-icons/bs";
import { AiOutlineHome } from "solid-icons/ai";

export const CellContent = ({
	cellValue,
	i,
	j,
	finalPath,
}: {
	cellValue: Accessor<number>;
	i: number;
	j: number;
	finalPath: Accessor<Position[]>;
}) => {
	const index = () => finalPath().findIndex(([x, y]) => x === i && y === j);

	const getPathArrow = () => {
		const idx = index();
		if (idx < 0) return null;

		const prevCell = idx > 0 ? finalPath()[idx - 1] : null;
		const nextCell = idx < finalPath().length - 1 ? finalPath()[idx + 1] : null;

		if (prevCell && nextCell) {
			const [prevX, prevY] = prevCell;
			const [nextX, nextY] = nextCell;
			const fromDirection = getDirection(prevX, prevY, i, j);
			const toDirection = getDirection(i, j, nextX, nextY);
			return `${fromDirection === toDirection ? fromDirection : `${fromDirection}-${toDirection}`}`;
		}

		if (nextCell) {
			const [nextX, nextY] = nextCell;
			return getDirection(i, j, nextX, nextY);
		}

		return null;
	};

	return (
		<Switch>
			<Match when={cellValue() === BlockType.START}>
				<AiOutlineHome class="w-full h-full text-white" />
			</Match>
			<Match when={cellValue() === BlockType.GOAL}>
				<OcGoal3 class="w-full h-full" />
			</Match>
			<Match when={cellValue() === BlockType.WALL}>
				<BsBricks class="w-full h-full" />
			</Match>
			<Match when={finalPath().length > 0 && index() >= 0}>
				<div class="size-4 animate-grow-shrink text-white">
					<CustomArrow type={getPathArrow()!} />
				</div>
			</Match>
		</Switch>
	);
};

const arrowPaths = {
	right: "M10 50 L90 50 M75 35 L90 50 L75 65",
	down: "M50 10 L50 90 M35 75 L50 90 L65 75",
	left: "M90 50 L10 50 M25 35 L10 50 L25 65",
	up: "M50 90 L50 10 M35 25 L50 10 L65 25",
	"right-right": "M10 50 L90 50 M75 35 L90 50 L75 65",
	"down-down": "M50 10 L50 90 M35 75 L50 90 L65 75",
	"left-left": "M90 50 L10 50 M25 35 L10 50 L25 65",
	"up-up": "M50 90 L50 10 M35 25 L50 10 L65 25",
	"down-right": "M30 30 Q30 70 70 70 M55 55 L70 70 L55 85",
	"down-left": "M90 10 Q90 70 30 70 M45 55 L30 70 L45 85",
	"up-right": "M10 90 Q10 30 70 30 M55 15 L70 30 L55 45",
	"up-left": "M90 90 Q90 30 30 30 M45 15 L30 30 L45 45",
	"right-down": "M10 30 Q70 30 70 90 M55 75 L70 90 L85 75",
	"right-up": "M10 70 Q70 70 70 10 M55 25 L70 10 L85 25",
	"left-down": "M90 30 Q30 30 30 90 M15 75 L30 90 L45 75",
	"left-up": "M90 70 Q30 70 30 10 M15 25 L30 10 L45 25",
};

const getDirection = (
	fromX: number,
	fromY: number,
	toX: number,
	toY: number,
): string => {
	if (fromX < toX) return "down";
	if (fromX > toX) return "up";
	if (fromY < toY) return "right";
	if (fromY > toY) return "left";
	return "";
};

const CustomArrow = ({ type }: { type: string }) => (
	<svg
		viewBox="0 0 100 100"
		xmlns="http://www.w3.org/2000/svg"
		class="w-full h-full"
	>
		<path
			d={arrowPaths[type]}
			fill="none"
			stroke="currentColor"
			stroke-width={10}
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
);
