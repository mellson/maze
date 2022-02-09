import React from 'react';

import './App.css';
import Stage from '../Stage';
import { useTypesafeActions } from '../../hooks/useTypesafeActions';
import { AppState } from './types';
import { Actions, reducer } from './reducer';
import { Form, ReplayButton } from './App.css.js';
import twitterLogo from '../../assets/images/twitter.png';

const FPS_DEFAULT = 30;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

const initialState: AppState = {
  playRequestTS: 0,
  fps: FPS_DEFAULT,
  cellSize: CellSize.DEFAULT,
  borderWeight: BORDER_WEIGHT_DEFAULT,
  // gridColumns: GRID_SIZE_DEFAULT * 2,
  gridColumns: GRID_SIZE_DEFAULT,
  gridRows: GRID_SIZE_DEFAULT,
  settingsChanging: false,
};

const App = () => {
  const [state, actions] = useTypesafeActions<AppState, typeof Actions>(
    reducer,
    initialState,
    Actions
  );

  return (
    <div className="App">
      <h1>Maze Generation - Recursive Backtracker</h1>
      <h2>Built with React, XState, Canvas, TypeScript</h2>
      <Form>
        <label>
          FPS ({state.fps})
          <input
            type="range"
            name="fps"
            value={state.fps}
            min="5"
            max="60"
            step={5}
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) => {
              actions.setFPS(parseInt(value, 10));
            }}
          />
        </label>
        <label>
          Cell Size ({state.cellSize})
          <input
            type="range"
            name="cellSize"
            value={state.cellSize}
            min={CellSize.MIN}
            max={CellSize.MAX}
            step={5}
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setCellSize(parseInt(value, 10))
            }
          />
        </label>
        <label>
          Border Weight ({state.borderWeight})
          <input
            type="range"
            name="borderWeight"
            value={state.borderWeight}
            min="1"
            max="10"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setBorderWeight(parseInt(value, 10))
            }
          />
        </label>
        <label>
          Grid Columns ({state.gridColumns})
          <input
            type="range"
            name="gridColumns"
            value={state.gridColumns}
            min="2"
            max="25"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setGridColumns(parseInt(value, 10))
            }
          />
        </label>
        <label>
          Grid Rows ({state.gridRows})
          <input
            type="range"
            name="gridRows"
            value={state.gridRows}
            min="2"
            max="25"
            onMouseDown={() => actions.setSettingsChanging(true)}
            onMouseUp={() => actions.setSettingsChanging(false)}
            onChange={({ target: { value } }) =>
              actions.setGridRows(parseInt(value, 10))
            }
          />
        </label>
        <ReplayButton
          onClick={(event) => {
            event.preventDefault();
            actions.createPlayRequest(new Date().getTime());
          }}
        >
          Replay
        </ReplayButton>
      </Form>
      <Stage
        playRequestTS={state.playRequestTS}
        width={APP_WIDTH}
        height={APP_HEIGHT}
        fps={state.fps}
        cellSize={state.cellSize}
        borderWeight={state.borderWeight}
        gridColumns={state.gridColumns}
        gridRows={state.gridRows}
        pixelRatio={1}
        settingsChanging={Boolean(state.settingsChanging)}
      />
      <footer className="App-footer">
        <a href="https://twitter.com/kvmaes" target="_blank">
          <img
            className="App-footer-image"
            src={twitterLogo}
            alt="Twitter logo"
          />
          @kvmaes
        </a>
      </footer>
    </div>
  );
};

export default App;
