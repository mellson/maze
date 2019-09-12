const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

class Cell {
  constructor({
    index,
    grid,
    size = 25,
    borderWeight = 2,
    borderColor = 'gray',
    cursorColor = 'yellow',
    visitedColor = 'rgba(0, 0, 0, 0.1)',
    backtrackColor = 'white',
    renderInitial = false,
    isStart = false,
    isMiddle = false,
    isEnd = false,
  }) {
    this.colIndex = index % grid.cols;
    this.rowIndex = Math.floor(index / grid.cols);
    this.x = this.colIndex * size + borderWeight;
    this.y = this.rowIndex * size + borderWeight;
    this.size = size;
    this.borderColor = borderColor;
    this.borderWeight = borderWeight;
    this.cursorColor = cursorColor;
    this.visitedColor = visitedColor;
    this.backtrackColor = backtrackColor;
    this.isStart = isStart;
    this.isMiddle = isMiddle;
    this.isEnd = isEnd;

    this.connections = [];

    if (renderInitial) {
      this.walls = [true, true, true, true];
    } else {
      this.walls = [false, false, false, false];
    }

    this.visited = false;
  }

  getNeighbors(grid) {
    const neighbors = DIRECTIONS.map(direction => {
      const [nRowIndex, nColIndex] = direction.getIndices(
        this.rowIndex,
        this.colIndex
      );
      // Ensure it is on the grid.
      if (
        nRowIndex < 0 ||
        nColIndex < 0 ||
        nRowIndex > grid.rows - 1 ||
        nColIndex > grid.cols - 1
      ) {
        return null;
      }
      const index = nRowIndex * grid.cols + nColIndex;
      return index;
    })
      .filter(index => index !== null)
      .map(index => grid.cells[index]);
    return neighbors;
  }

  getUnvisitedNeighbors(grid) {
    return this.getNeighbors(grid).filter(neighbor => {
      return !neighbor.isVisited();
    });
  }

  getSolutionNeighbors(grid) {
    return this.getNeighbors(grid).filter(neighbor => {
      if (neighbor.colIndex > this.colIndex) {
        if (this.walls[EAST]) {
          return false;
        }
      }
      if (neighbor.colIndex < this.colIndex) {
        if (this.walls[WEST]) {
          return false;
        }
      }

      if (neighbor.rowIndex > this.rowIndex) {
        if (this.walls[SOUTH]) {
          return false;
        }
      }
      if (neighbor.rowIndex < this.rowIndex) {
        if (this.walls[NORTH]) {
          return false;
        }
      }
      return true;
    });
  }

  connect(cell, { mutual } = { mutual: true }) {
    this.connections.push(cell);

    if (this.rowIndex > cell.rowIndex) {
      this.walls[NORTH] = false;
    }

    if (this.rowIndex < cell.rowIndex) {
      this.walls[SOUTH] = false;
    }

    if (this.colIndex > cell.colIndex) {
      this.walls[WEST] = false;
    }

    if (this.colIndex < cell.colIndex) {
      this.walls[EAST] = false;
    }

    if (mutual) {
      cell.connect(this, { mutual: false });
    }
  }

  disconnect(cell, { mutual } = { mutual: true }) {
    this.connections = this.connections.filter(c => c.index === cell.index);

    if (mutual) {
      cell.disconnect(this, { mutual: false });
    }
  }

  markSolution(direction) {
    // Add line in the correct direction
  }

  unmarkSolution() {
    // Remove line
  }

  isVisited() {
    return this.visited;
  }

  markVisited(prevCell, pathId) {
    // console.log('pathId', pathId);
    this.pathId = pathId;
    this.visited = true;

    // Mark the search cursor with a different color.
    // This will be set to false at the end of draw().
    this.cursor = true;

    const fillColor = this.getFillColor();
    fill(fillColor);
    noStroke();
    const cursorX = this.x + 0.5 * this.borderWeight;
    const cursorY = this.y + 0.5 * this.borderWeight;
    square(cursorX, cursorY, this.size - this.borderWeight);

    if (!this.isStart && !this.isEnd) {
      this.walls = [true, true, true, true];
    }

    if (prevCell) {
      this.connect(prevCell);
    }

    // Open the start and end cells to enter/exit the maze.
    if (this.isStart) {
      this.walls[WEST] = false;
    } else if (this.isEnd) {
      this.walls[EAST] = false;
    }

    return this;
  }

  hasDifferentPathId(cell) {
    return this.pathId && cell.pathId && this.pathId !== cell.pathId;
  }

  getFillColor() {
    switch (true) {
      case this.blockedExternal:
      case this.blockedInternal:
        return this.borderColor;
      case this.cursor:
        return this.cursorColor;
      case this.backtrack:
        return this.backtrackColor;
      case this.visited:
        return this.visitedColor;
      default:
        return 'white';
    }
  }

  draw() {
    const fillColor = this.getFillColor();
    fill(fillColor);
    noStroke();

    const fillX = this.x + 0.5 * this.borderWeight;
    const fillY = this.y + 0.5 * this.borderWeight;
    square(fillX, fillY, this.size);

    stroke(this.borderColor);
    strokeWeight(this.borderWeight);

    if (this.walls[0]) {
      line(this.x, this.y, this.x + this.size, this.y);
    }

    if (this.walls[1]) {
      line(this.x + this.size, this.y, this.x + this.size, this.y + this.size);
    }

    if (this.walls[2]) {
      line(this.x, this.y + this.size, this.x + this.size, this.y + this.size);
    }

    if (this.walls[3]) {
      line(this.x, this.y, this.x, this.y + this.size);
    }

    // Set cursor to false so it only shows on a single render.
    this.cursor = false;
  }
}
