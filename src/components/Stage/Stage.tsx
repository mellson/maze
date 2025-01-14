import React, { Ref } from 'react';

import Grid from '../generation/Grid';
import { Canvas } from './Stage.css';
import {
  AppMachineEvent,
  GenerationParams,
} from '../../statechart/appMachineTypes';

interface Props {
  generationParams: GenerationParams;
  width?: number;
  height?: number;
  pixelRatio?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appSend: (event: AppMachineEvent) => void;
  generationSessionId: number;
  paramsAreChanging: boolean;
}

export const Stage = React.memo(
  ({
    width = 100,
    height = 100,
    pixelRatio = window.devicePixelRatio,
    generationParams,
    appSend,
    generationSessionId,
  }: Props) => {
    const { cellSize, borderWeight, gridColumns, gridRows } = generationParams;

    const canvasRef: Ref<HTMLCanvasElement> = React.useRef(null);
    const gridRef = React.useRef<Grid | null>(null);

    React.useEffect(() => {
      if (canvasRef && canvasRef.current) {
        const canvasCtx = canvasRef.current.getContext(
          '2d'
        ) as CanvasRenderingContext2D;
        canvasCtx.clearRect(0, 0, width, height);

        gridRef.current = new Grid(
          canvasCtx,
          gridColumns,
          gridRows,
          0,
          cellSize,
          borderWeight
          // blockedCells: [50, 54, 65, 80, 95, 110, 69, 84, 99, 114, 66, 68, 82],
        );
        // TODO: Can omit fps and send that directly from appMachine -> algo machine.
        appSend({ type: 'refs.inject', params: { gridRef } });
      }
    }, [
      generationParams,
      height,
      width,
      borderWeight,
      cellSize,
      gridColumns,
      gridRows,
      appSend,
      generationSessionId,
    ]);

    if (gridRef.current && gridRef.current.getCanvasCtx()) {
      gridRef.current.draw();
    }

    const dw =
      Math.floor(pixelRatio * cellSize * gridColumns) + 2 * borderWeight;
    const dh = Math.floor(pixelRatio * cellSize * gridRows) + 2 * borderWeight;

    return <Canvas ref={canvasRef} width={dw} height={dh} />;
  },
  (_, { paramsAreChanging }) => paramsAreChanging
);

Stage.displayName = 'Stage (memo)';
