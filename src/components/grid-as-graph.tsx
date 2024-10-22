import type { DialogTriggerProps } from "@kobalte/core/dialog";
import {
  type Accessor,
  For,
  type JSX,
  createMemo,
  createSignal,
} from "solid-js";
import { BlockType, type Grid, type Position } from "~/libs/types";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface GraphNode {
  value: BlockType;
  connections: {
    top: GraphNode | null;
    right: GraphNode | null;
    bottom: GraphNode | null;
    left: GraphNode | null;
  };
  row: number;
  col: number;
}

interface NodePosition {
  x: number;
  y: number;
}

const NODE_RADIUS = 10;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 40;

function GraphIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 256 256"
    >
      <path
        fill="currentColor"
        d="M200 156a27.87 27.87 0 0 0-19.4 7.84l-28.28-22A27.8 27.8 0 0 0 156 128a28 28 0 0 0-.45-5l19.45-6.45a28.07 28.07 0 1 0-2.53-7.58L153 115.45A28 28 0 0 0 128 100a27.7 27.7 0 0 0-7.6 1.06l-9.5-21.37A28 28 0 1 0 96 84a27.7 27.7 0 0 0 7.6-1.06l9.5 21.37a27.95 27.95 0 0 0-8.46 39.1L74 170.61a28 28 0 1 0 5.32 6l30.6-27.2a27.92 27.92 0 0 0 37.44-1.23l28.28 22A28 28 0 1 0 200 156m0-72a20 20 0 1 1-20 20a20 20 0 0 1 20-20M76 56a20 20 0 1 1 20 20a20 20 0 0 1-20-20M56 212a20 20 0 1 1 20-20a20 20 0 0 1-20 20m72-64a20 20 0 1 1 20-20a20 20 0 0 1-20 20m72 56a20 20 0 1 1 20-20a20 20 0 0 1-20 20"
      />
    </svg>
  );
}

const gridToGraph = (
  grid: Grid,
  startRow: number,
  startCol: number,
): GraphNode | null => {
  if (grid.length === 0 || grid[0].length === 0) {
    return null;
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const nodeMap: Map<string, GraphNode> = new Map();

  const createNode = (row: number, col: number): GraphNode => {
    const key = `${row},${col}`;
    if (nodeMap.has(key)) {
      return nodeMap.get(key)!;
    }
    const newNode: GraphNode = {
      value: grid[row][col],
      connections: { top: null, right: null, bottom: null, left: null },
      row,
      col,
    };
    nodeMap.set(key, newNode);
    return newNode;
  };

  const root = createNode(startRow, startCol);
  const queue: GraphNode[] = [root];

  const directions = [
    [-1, 0, "top"],
    [0, 1, "right"],
    [1, 0, "bottom"],
    [0, -1, "left"],
  ] as const;

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    const { row, col } = currentNode;

    if (visited.has(`${row},${col}`)) continue;
    visited.add(`${row},${col}`);

    for (const [dx, dy, direction] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;

      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        const neighborNode = createNode(newRow, newCol);
        currentNode.connections[direction] = neighborNode;

        if (
          grid[newRow][newCol] !== BlockType.TERRAIN_IMPOSSIBLE &&
          !visited.has(`${newRow},${newCol}`)
        ) {
          queue.push(neighborNode);
        }
      }
    }
  }

  return root;
};

const calculateGraphDimensions = (
  root: GraphNode,
): { width: number; height: number; minRow: number; minCol: number } => {
  let minRow = Number.POSITIVE_INFINITY;
  let maxRow = Number.NEGATIVE_INFINITY;
  let minCol = Number.POSITIVE_INFINITY;
  let maxCol = Number.NEGATIVE_INFINITY;

  const queue: GraphNode[] = [root];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    const key = `${node.row},${node.col}`;

    if (visited.has(key)) continue;
    visited.add(key);

    minRow = Math.min(minRow, node.row);
    maxRow = Math.max(maxRow, node.row);
    minCol = Math.min(minCol, node.col);
    maxCol = Math.max(maxCol, node.col);

    for (const neighbor of Object.values(node.connections)) {
      if (neighbor) queue.push(neighbor);
    }
  }

  const width = (maxCol - minCol + 1) * HORIZONTAL_SPACING;
  const height = (maxRow - minRow + 1) * VERTICAL_SPACING;

  return { width, height, minRow, minCol };
};

const GraphNode = (props: {
  node: GraphNode;
  position: NodePosition;
  nodes: Map<string, NodePosition>;
  updateCell: (row: number, col: number) => void;
}) => {
  const getNodeColor = (value: BlockType) => {
    switch (value) {
      case BlockType.START:
        return "#22C55E";
      case BlockType.GOAL:
        return "#EF4444";
      // case BlockType.VISITED: return "#16A34A";
      case BlockType.TERRAIN_IMPOSSIBLE:
        return "transparent";
      default:
        return "#ffffff";
    }
  };

  const renderEdge = (start: NodePosition, end: NodePosition) => (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke="#4B5563"
      stroke-width="1"
    />
  );

  return (
    <g>
      {props.node.value !== BlockType.TERRAIN_IMPOSSIBLE && (
        <circle
          onClick={() => props.updateCell(props.node.row, props.node.col)}
          class="z-100"
          cx={props.position.x}
          cy={props.position.y}
          r={NODE_RADIUS}
          fill={getNodeColor(props.node.value)}
          stroke="#000000"
          stroke-width="1"
        />
      )}
      <For each={Object.entries(props.node.connections)}>
        {([_, connectedNode]) => {
          if (
            connectedNode &&
            connectedNode.value !== BlockType.TERRAIN_IMPOSSIBLE
          ) {
            const key = `${connectedNode.row},${connectedNode.col}`;
            const connectedPosition = props.nodes.get(key);
            if (connectedPosition) {
              return renderEdge(props.position, connectedPosition);
            }
          }
          return null;
        }}
      </For>
    </g>
  );
};

export function GraphView({
  grid,
  startPoint,
  updateCell,
}: {
  grid: Accessor<Grid>;
  startPoint: Accessor<Position | undefined>;
  updateCell: (row: number, col: number) => void;
}) {
  const [open, setOpen] = createSignal(false);
  const [containerSize, setContainerSize] = createSignal({
    width: 0,
    height: 0,
  });

  const graphRoot = createMemo(() =>
    !!startPoint() && !!open()
      ? gridToGraph(grid(), startPoint()![0], startPoint()![1])
      : undefined,
  );
  const graphInfo = createMemo(() =>
    graphRoot()
      ? calculateGraphDimensions(graphRoot()!)
      : { width: 0, height: 0, minRow: 0, minCol: 0 },
  );

  const nodePositions = createMemo(() => {
    const positions = new Map<string, NodePosition>();
    if (graphRoot()) {
      const queue: GraphNode[] = [graphRoot()!];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const node = queue.shift()!;
        const key = `${node.row},${node.col}`;

        if (visited.has(key)) continue;
        visited.add(key);

        const position = {
          x:
            (node.col - graphInfo().minCol) * HORIZONTAL_SPACING +
            NODE_RADIUS * 2,
          y:
            (node.row - graphInfo().minRow) * VERTICAL_SPACING +
            NODE_RADIUS * 2,
        };
        positions.set(key, position);

        for (const connectedNode of Object.values(node.connections)) {
          if (connectedNode) queue.push(connectedNode);
        }
      }
    }

    return positions;
  });

  const renderGraph = () => {
    if (!graphRoot()) return null;

    const queue: GraphNode[] = [graphRoot()!];
    const visited = new Set<string>();
    const elements: JSX.Element[] = [];

    while (queue.length > 0) {
      const node = queue.shift()!;
      const key = `${node.row},${node.col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const position = nodePositions().get(key);
      if (position) {
        elements.push(
          <GraphNode
            node={node}
            position={position}
            nodes={nodePositions()}
            updateCell={updateCell}
          />,
        );

        for (const connectedNode of Object.values(node.connections)) {
          if (connectedNode) queue.push(connectedNode);
        }
      }
    }

    return elements;
  };

  const viewBox = () =>
    `0 0 ${graphInfo().width + NODE_RADIUS * 4} ${graphInfo().height + NODE_RADIUS * 4}`;

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger
        as={(props: DialogTriggerProps) => (
          <Button
            type="button"
            variant="outline"
            disabled={!startPoint()}
            {...props}
          >
            <GraphIcon />
          </Button>
        )}
      />
      <DialogContent class="w-[80vw] h-[80vh] max-w-full max-h-full p-4">
        <div
          class="relative w-full h-full overflow-auto"
          ref={(el) => {
            if (
              el &&
              (el.clientWidth !== containerSize().width ||
                el.clientHeight !== containerSize().height)
            ) {
              setContainerSize({
                width: el.clientWidth,
                height: el.clientHeight,
              });
            }
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={viewBox()}
            preserveAspectRatio="xMidYMid meet"
            class="border border-gray-200"
          >
            {renderGraph()}
          </svg>
        </div>
      </DialogContent>
    </Dialog>
  );
}
