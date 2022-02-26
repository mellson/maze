import { Ref } from 'react';
import type { Cell, CellMethods } from '../components/generation/Cell';
import type { Grid, GridMethods } from '../components/generation/Grid';

export type ICell = Cell & CellMethods;

export type ContextGrid = Grid & GridMethods;

export interface MazeGenerationContext {
  canPlay: boolean;
  currentCell: ICell | undefined;
  eligibleNeighbors: Cell[];
  fps: number;
  grid: ContextGrid | undefined;
  pathId: string;
  stack: ICell[];
  startIndex: number;
}

export type InjectRefsEvent = {
  type: 'INJECT_REFS';
  gridRef: Ref<Grid>;
};

export type StartEvent = {
  type: 'START';
};

export type PlayEvent = {
  type: 'PLAY';
};

export type PauseEvent = {
  type: 'PAUSE';
};

export type MazeGenerationEvent =
  | InjectRefsEvent
  | StartEvent
  | PlayEvent
  | PauseEvent;

export type Typestate =
  | {
      value: 'maze-idle';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'start';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'seek';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'advance';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'backtrack';
      type: string;
      context: MazeGenerationContext;
    }
  | {
      value: 'complete';
      type: string;
      context: MazeGenerationContext;
    };
