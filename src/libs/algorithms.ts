import { type AlgorithmProps, BlockType, type Position } from "~/libs/types";

const isValid = (
  x: number,
  y: number,
  rows: number,
  cols: number,
  grid: number[][],
) => {
  return (
    x >= 0 &&
    x < rows &&
    y >= 0 &&
    y < cols &&
    grid[x][y] !== BlockType.TERRAIN_IMPOSSIBLE
  );
};

function reconstructPath(parent: (Position | null)[][], x: number, y: number) {
  const path: Position[] = [];
  let current: Position | null = [x, y];
  while (current) {
    path.unshift(current);
    current = parent[current[0]][current[1]];
  }
  return path;
}

export const getTerrainCost = (cellValue: BlockType) => {
  return cellValue - BlockType.TERRAIN_EASY + 1;
};

export async function dfs({
  start,
  goal,
  rows,
  cols,
  grid,
  markCellAsVisited,
}: AlgorithmProps): Promise<Position[] | null> {
  const stack: Position[] = [start];
  const visited: boolean[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent: (Position | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;

    if (x === goal[0] && y === goal[1]) {
      return reconstructPath(parent, x, y);
    }

    if (!visited[x][y]) {
      visited[x][y] = true;
      await markCellAsVisited(x, y);

      const directions: Position[] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        if (isValid(newX, newY, rows, cols, grid) && !visited[newX][newY]) {
          stack.push([newX, newY]);
          parent[newX][newY] = [x, y];
        }
      }
    }
  }

  return null; // No path found
}

export const bfs = async ({
  start,
  goal,
  rows,
  cols,
  grid,
  markCellAsVisited,
}: AlgorithmProps): Promise<Position[] | null> => {
  const queue: Position[] = [start];
  const visited: boolean[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const parent: (Position | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;

    if (x === goal[0] && y === goal[1]) {
      return reconstructPath(parent, x, y);
    }

    visited[x][y] = true;
    await markCellAsVisited(x, y);

    const directions: Position[] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (isValid(newX, newY, rows, cols, grid) && !visited[newX][newY]) {
        queue.push([newX, newY]);
        parent[newX][newY] = [x, y];
        visited[newX][newY] = true;
      }
    }
  }

  return null; // No path found
};

export const aStar = async ({
  start,
  goal,
  rows,
  cols,
  grid,
  markCellAsVisited,
}: AlgorithmProps): Promise<Position[] | null> => {
  const heuristic = (x1: number, y1: number, x2: number, y2: number) =>
    Math.abs(x1 - x2) + Math.abs(y1 - y2);

  interface Node {
    pos: Position;
    g: number;
    f: number;
  }

  const openList: Node[] = [
    { 
      pos: start, 
      g: 0, 
      f: heuristic(start[0], start[1], goal[0], goal[1]) 
    },
  ];
  
  const closed: boolean[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));

  const parent: (Position | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const {
      pos: [x, y],
      g,
    } = openList.shift()!;

    if (x === goal[0] && y === goal[1]) {
      return reconstructPath(parent, x, y);
    }

    closed[x][y] = true;
    await markCellAsVisited(x, y);

    const directions: Position[] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      
      if (
        isValid(newX, newY, rows, cols, grid) &&
        !closed[newX][newY]
      ) {
        const terrainCost = getTerrainCost(grid[newX][newY]);
        const newG = g + terrainCost;
        const newF = newG + heuristic(newX, newY, goal[0], goal[1]);

        const existingNode = openList.find(
          (node) => node.pos[0] === newX && node.pos[1] === newY,
        );
        
        if (!existingNode || newG < existingNode.g) {
          if (existingNode) {
            existingNode.g = newG;
            existingNode.f = newF;
          } else {
            openList.push({ pos: [newX, newY], g: newG, f: newF });
          }
          parent[newX][newY] = [x, y];
        }
      }
    }
  }

  return null; // No path found
};


export const dijkstra = async ({
  start,
  goal,
  rows,
  cols,
  grid,
  markCellAsVisited,
}: AlgorithmProps): Promise<Position[] | null> => {
  const distances: number[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Number.POSITIVE_INFINITY));

  const parent: (Position | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  const openList: { pos: Position; distance: number }[] = [
    { pos: start, distance: 0 },
  ];

  distances[start[0]][start[1]] = 0;

  while (openList.length > 0) {
    openList.sort((a, b) => a.distance - b.distance);
    const {
      pos: [x, y],
      distance,
    } = openList.shift()!;

    if (x === goal[0] && y === goal[1]) {
      return reconstructPath(parent, x, y);
    }

    await markCellAsVisited(x, y);

    const directions: Position[] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (isValid(newX, newY, rows, cols, grid)) {
        const terrainCost = getTerrainCost(grid[newX][newY]);
        const newDistance = distance + terrainCost;

        // If new path is shorter than known distance (including unvisited nodes with Infinity)
        if (newDistance < distances[newX][newY]) {
          distances[newX][newY] = newDistance;
          parent[newX][newY] = [x, y];

          const existingNode = openList.find(
            (node) => node.pos[0] === newX && node.pos[1] === newY,
          );

          if (existingNode) {
            existingNode.distance = newDistance;
          } else {
            openList.push({ pos: [newX, newY], distance: newDistance });
          }
        }
      }
    }
  }

  return null; // No path found
};

interface Node {
  pos: Position;
  parent: Position | null;
}

export const bidirectionalSearch = async ({
  start,
  goal,
  rows,
  cols,
  grid,
  markCellAsVisited,
}: AlgorithmProps): Promise<Position[] | null> => {
  const forwardQueue: Node[] = [{ pos: start, parent: null }];
  const backwardQueue: Node[] = [{ pos: goal, parent: null }];

  // Use 2D arrays instead of Maps
  const forwardVisited: (Node | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));
  const backwardVisited: (Node | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  let meetingPoint: Position | null = null;

  while (forwardQueue.length > 0 && backwardQueue.length > 0) {
    // Forward search
    meetingPoint = await expandFrontier(
      forwardQueue,
      forwardVisited,
      backwardVisited,
      rows,
      cols,
      grid,
      markCellAsVisited,
    );
    if (meetingPoint) break;

    // Backward search
    meetingPoint = await expandFrontier(
      backwardQueue,
      backwardVisited,
      forwardVisited,
      rows,
      cols,
      grid,
      markCellAsVisited,
    );
    if (meetingPoint) break;
  }

  if (meetingPoint) {
    return reconstructBiDirectionalPath(
      meetingPoint,
      forwardVisited,
      backwardVisited,
    );
  }

  return null;
};

async function expandFrontier(
  queue: Node[],
  visited: (Node | null)[][],
  otherVisited: (Node | null)[][],
  rows: number,
  cols: number,
  grid: number[][],
  markCellAsVisited: (row: number, col: number) => Promise<void>,
): Promise<Position | null> {
  if (queue.length === 0) return null;

  const {
    pos: [x, y],
    parent,
  } = queue.shift()!;

  if (visited[x][y]) return null;

  visited[x][y] = { pos: [x, y], parent };
  await markCellAsVisited(x, y);

  // Check if we've met the other frontier
  if (otherVisited[x][y]) {
    return [x, y];
  }

  const directions: Position[] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;

    if (isValid(newX, newY, rows, cols, grid) && !visited[newX][newY]) {
      queue.push({
        pos: [newX, newY],
        parent: [x, y],
      });
    }
  }

  return null;
}

function reconstructBiDirectionalPath(
  meetingPoint: Position,
  forwardVisited: (Node | null)[][],
  backwardVisited: (Node | null)[][],
): Position[] {
  const path: Position[] = [];

  // Reconstruct path from meeting point to start
  let current: Position | null = meetingPoint;
  while (current) {
    path.unshift(current);
    const node = forwardVisited[current[0]]![current[1]];
    current = node?.parent || null;
  }

  // Reconstruct path from meeting point to goal
  current = meetingPoint;
  while (current) {
    const node = backwardVisited[current[0]][current[1]];
    current = node?.parent || null;
    if (current) {
      path.push(current);
    }
  }

  return path;
}
