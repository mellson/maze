import { createMachine, ContextFrom } from 'xstate';
import {
  GenerationParams,
  AppMachineContext,
  AppMachineEvent,
} from './appMachineTypes';
import { generationAlgorithmMachine } from './recursiveBacktracker.machine';

const FPS_DEFAULT = 30;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

export const defaultGenerationParams: GenerationParams = {
  borderWeight: BORDER_WEIGHT_DEFAULT,
  cellSize: CellSize.DEFAULT,
  fps: FPS_DEFAULT,
  gridColumns: GRID_SIZE_DEFAULT,
  gridRows: GRID_SIZE_DEFAULT,
};

const initialAppMachineContext: AppMachineContext = {
  mazeId: '',
  generationParams: defaultGenerationParams,
  gridRef: undefined,
  generationSessionId: new Date().getTime(),
};

export const appMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqDEMB2YBOyALgJYD22AdKsgQLYWxiEDaADALqKiqmzEnkuIAB6IAtAE4ATBIoSAHAGZWU+QDYA7Gplr5AGhABPcQBYJrCgEZ50xRICsa1pZP2HAX3cG0qCgEkIABswDDwwADNYCmJsACswAGMWDiEePgFsIVEEMQ0TCykTeVZFJzc1ZSkDYxzFe0sKVXtFE1VLR3qNe09vdAoAcTBcAhJsKAwIYlhUQORDCgBXVAgiMDZOJBA0-jJMzez5KQ1G+w1WIqk61i7q8Qk1CkUtdQlS+XlLKXsTHpAfAaG+CIMXGOCBGQo4RiUwAFutUrwdoJ9ognIoKHlFJ9LPd6vl7LccporEoZE8ZBJ2q1fv9BsNgWN-NgdshAsQAF4gjAJciEPCkQJRGZzeGbbYZLLiRSFRrqLR1NSWVgVEyEsSXCzKLquSylLTNGl9OngkEUAAKs0MXJ52D5AqFyAWjFF3EREpRCEu8goNnaxSelicrHs+iM4i+snaCg+wY0l3aikNvmNI1NFrm1t5-MFDEIpFQLq2bt2kpyGnRNg0SnMEar5bVLhMFCKTg+Wle10OSYB9NGUHNjsYEG5WftVEthfFJY9hSbrW+dm0rkqGjVdQaTRabQ6li63ZTDP7ZsHkBHtuzUVgeYLKTFxeRoGyuQrEirdhUbjrijVJge7UDgalLu7wSD8Xh-EagKpoyx5OqeNp2jmV5gL44SkHgADuNAQJO957I+qK-o8oHKtolzSholhrnYjRPNIyrSI40rdOB-wACLkCE-xhFeNDJBsrrpNOBE5K8Dzlsoai6JcUhqA4hLtM2ujyGcaghsUnSJr82CkBAcBCD4CJCQ+Ih3PITYSaRhzSnJBJhjkbhSI0JjtLojgVLo3YBMERlIvhpk5OoFifnUNi6OcZhrqojxYmiahmHYUj7lBh6+e6IliM03pKqcXRYuZSirvZmXnBiFSfBUXTmGYajJb2pp+MyJCshyIJpcJAViGYFg5RoeXWEUpRqhqjzXN89R6mpWm9MmKV9ualptXexn+U+nzopYLh9dKyisMURzDc0GISNIr5aJ8fUqHVJowSeEDtSZ2SOLI5UOM4qiycNpSNMqLjWOYr67rVrF9BxuAPatqL2D1hxxlIUiBqdVT2Yo3qtLJrAKF8ypmGBnhAA */
  createMachine({
    schema: {
      context: {} as AppMachineContext,
      events: {} as AppMachineEvent,
    },
    tsTypes: {} as import('./app.machine.typegen').Typegen0,
    context: initialAppMachineContext,
    id: 'app',
    initial: 'Idle',
    states: {
      Idle: {
        on: {
          'refs.inject': {
            actions: ['storeGridRef'],
            target: 'Generating',
          },
        },
      },
      Generating: {
        initial: 'Initializing',
        invoke: {
          id: 'generationAlgorithmMachine',
          src: 'childMachine',
          data: (ctx) => {
            const defaultChildMachineContext = {
              canPlay: true,
              currentCell: undefined,
              eligibleNeighbors: [],
              stack: [],
              startIndex: 0,
            };

            const childContext: ContextFrom<typeof generationAlgorithmMachine> =
              {
                ...defaultChildMachineContext,
                fps: ctx.generationParams.fps,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                grid: (ctx.gridRef as any).current,
                pathId: ctx.generationSessionId.toString(),
              };

            return childContext;
          },
        },
        on: {
          'display.update': {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            actions: [() => {}],
          },
          'generation.finish': {
            target: 'Done',
          },
        },
        states: {
          Initializing: {
            on: {
              'controls.play': {
                target: 'Playing',
              },
            },
          },
          Playing: {
            onEntry: 'startGenerationAlgorithmMachine',
            on: {
              'controls.pause': {
                actions: ['pauseGenerationAlgorithmMachine'],
                target: 'Paused',
              },
              'controls.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
            },
          },
          Paused: {
            on: {
              'controls.play': {
                actions: ['playGenerationAlgorithmMachine'],
                target: 'Playing',
              },
              'controls.stop': {
                actions: ['refreshGenerationSessionId'],
                target: '#app.Idle',
              },
              'controls.step.forward': {
                actions: ['stepGenerationAlgorithmMachine'],
              },
            },
          },
        },
      },
      Done: {
        on: {
          'app.restart': {
            actions: ['refreshGenerationSessionId'],
            target: 'Idle',
          },
        },
      },
    },
    on: {
      'generation.param.set': {
        actions: ['updateGenerationParams'],
        target: 'Idle',
      },
    },
  });

// const service = interpret(appMachine).subscribe((state) => {
//   console.log('appMachine:', state.value);
// });

// service.start();
