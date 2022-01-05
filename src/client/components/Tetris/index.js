/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Redux
import { checkCollision } from './helpers';
import { selectGameStatus } from '../../store/selectors';
import { setGameStatus } from '../../store/actions';

// Custom Hooks
import useGrid from '../../hooks/useGrid';
import usePlayer from '../../hooks/usePlayer';
import useInterval from '../../hooks/useInterval';
import useGameStatus from '../../hooks/useGameStatus';

// Components
import Grid from './Grid';
import Card from './Card';
import StartButton from './StartButtton';
import { StyledTetris, StyledTetrisWrapper } from '../styles/StyledTetris';

function Tetris() {
  const dispatch = useDispatch();
  const gameStatus = useSelector(selectGameStatus);
  const checked = true; // TODO should be assigned when room is checked
  const [dropTime, setDropTime] = useState(null);
  const [player, updatePlayerPos, resetPlayer, rotateIfPossible] = usePlayer();
  // TODO above nb_players should be len(players)
  const [grid, linesCleared, startGame] = useGrid(player, resetPlayer, 1, setDropTime);
  const [score, lines, level, setLevel] = useGameStatus(linesCleared);

  // move down each dropTime

  const drop = () => {
    // official speedCurve = https://harddrop.com/wiki/Tetris_Worlds
    if (lines >= (level + 1) * 10) {
      setLevel(level + 1);
      setDropTime((0.8 - ((level) * 0.007)) ** (level) * 1000);
    }
    if (!checkCollision(player, grid, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        dispatch(setGameStatus(2));
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const movePlayer = (direction) => {
    if (!checkCollision(player, grid, { x: direction, y: 0 })) {
      updatePlayerPos({ x: direction, y: 0, collided: false });
    }
  };

  const dropPlayer = () => {
    drop();
  };

  const move = ({ keyCode }) => {
    if (gameStatus === 1) { // if playing
      if (keyCode === 37) {
        movePlayer(-1);
      } else if (keyCode === 39) {
        movePlayer(1);
      } else if (keyCode === 40) {
        dropPlayer();
      } else if (keyCode === 38) {
        rotateIfPossible(grid, 1);
      } else if (keyCode === 32) { // todo hard drop
        console.log('space');
      }
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  return (
    <StyledTetrisWrapper role="button" tabIndex="0" onKeyDown={move}>
      { checked
      && (
        <StyledTetris>
          <Grid grid={grid} />
          <aside>
            {gameStatus === 2
              ? <Card gameOver={gameStatus === 2} text={`Game Over: ${score} points`} />
              : (
                <div>
                  <Card text={`Score: ${score}`} />
                  <Card text={`Lines: ${lines}`} />
                  <Card text={`Level: ${level + 1}`} />
                </div>
              )}
            {/* eslint-disable-next-line max-len */}
            {/* TODO should send start message to socket and autofocus on the grid (1 click needed for now) */}
            { gameStatus !== 1 && <StartButton cb={startGame} />}
          </aside>
        </StyledTetris>
      )}
    </StyledTetrisWrapper>
  );
}

export default Tetris;
