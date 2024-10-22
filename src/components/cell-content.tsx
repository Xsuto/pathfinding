import { AiOutlineHome } from "solid-icons/ai";
import { BsBricks } from "solid-icons/bs";
import { OcGoal3 } from "solid-icons/oc";
import { Match, Switch } from "solid-js";
import type { Accessor } from "solid-js";
import { BlockType, type Position } from "~/libs/types";

function MountainsIcon(props: { class: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="m17.012 3.021l-.912 1.66l-6.522 11.856l-1.916-1.916l-.66 1.098l-5.86 9.767L.235 27h31.284l-.598-1.395l-3-7l-.582-1.357l-2.068 2.068l-7.403-14.605zm-.073 4.282l3.04 5.996l-.774.664l-2.28-1.953l-2.279 1.953l-.93-.799zm-.013 7.34l2.28 1.953l1.702-1.46l3.2 6.315l.622 1.233l1.932-1.932L28.482 25H3.766l4.293-7.154l1.988 1.988l.642-1.166l2.043-3.713l1.914 1.64z"
      />
    </svg>
  );
}

function GrassIcon(props: { class?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="none">
        <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
        <path
          fill="currentColor"
          d="M6.356 3.235a1 1 0 0 1 1.168-.087c3.456 2.127 5.35 4.818 6.36 7.78c.25.733.445 1.48.596 2.236c1.029-1.73 2.673-3.102 5.149-4.092a1 1 0 0 1 1.329 1.215l-.181.604C19.417 15.419 19 16.806 19 20a1 1 0 1 1-2 0c0-3.055.38-4.7 1.37-8.042c-1.122.744-1.861 1.608-2.357 2.565C15.248 15.997 15 17.805 15 20a1 1 0 1 1-2 0c0-2.992-.13-5.847-1.009-8.427c-.59-1.729-1.522-3.351-3.018-4.802C9.99 10.631 10 14.355 10 19.745V20a1 1 0 1 1-2 0c0-2.29-.01-4.371-.577-6.13c-.326-1.013-.84-1.92-1.683-2.674C6.66 14.349 7 16.683 7 20a1 1 0 1 1-2 0c0-3.864-.472-6.255-1.949-10.684a1 1 0 0 1 1.32-1.244c1.395.557 2.455 1.301 3.255 2.18a24 24 0 0 0-1.554-5.88a1 1 0 0 1 .284-1.137"
        />
      </g>
    </svg>
  );
}

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
      <Match when={finalPath().length > 0 && index() >= 0}>
        <div class="size-5 animate-grow-shrink text-white">
          <CustomArrow type={getPathArrow()!} />
        </div>
      </Match>
      <Match when={cellValue() === BlockType.TERRAIN_MEDIUM}>
        <GrassIcon class="w-full h-full" />
      </Match>
      <Match when={cellValue() === BlockType.TERRAIN_HARD}>
        <MountainsIcon class="w-full h-full" />
      </Match>
      <Match when={cellValue() === BlockType.TERRAIN_IMPOSSIBLE}>
        <BsBricks class="w-full h-full" />
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
