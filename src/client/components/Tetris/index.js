/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Redux
import { useLocation, useParams } from 'react-router-dom';
import { checkCollision, checkParams } from './helpers';
import {
  selectGameStatus, selectReady, selectSocket, selectUsers,
} from '../../store/selectors';
import {
  setGameStatus,
  setError,
  joinRoomSocket,
  checkRoomSocket,
} from '../../store/actions';

// Custom Hooks
import useGrid from '../../hooks/useGrid';
import usePlayer from '../../hooks/usePlayer';
import useInterval from '../../hooks/useInterval';
import useGameStatus from '../../hooks/useGameStatus';

// Components
import Grid from './Grid';
import Card from './Card';
import Lobby from './Lobby';
import StartButton from './StartButtton';
import { StyledTetris, StyledTetrisWrapper } from '../styles/StyledTetris';
import Loader from '../Loader';

function Tetris() {
  const dispatch = useDispatch();
  const gameStatus = useSelector(selectGameStatus);
  const socket = useSelector(selectSocket);
  const users = useSelector(selectUsers);
  const isMounted = useRef(true);
  const { roomName, username } = useParams();
  const ready = useSelector(selectReady);

  const [isAdmin, setIsAdmin] = useState(null);
  const [checked, setChecked] = useState(null);
  const [dropTime, setDropTime] = useState(null);
  const [player, updatePlayerPos, resetPlayer, rotateIfPossible] = usePlayer();
  const [grid, linesCleared] = useGrid(player, resetPlayer, users.length, setDropTime);
  const [score, lines, level, setLevel] = useGameStatus(linesCleared);
  const [serverStatus, setServerStatus] = useState(true);

  // useEffect(() => {
  // todo leave room, change username
  // }, [roomName, username]);

  // useEffect hook is called each time one of its deps is modified
  // here the array is empty, it will run once on ComponentDidMount
  // its returned function is called when the components unmounts
  // isMounted ref checks that no re-renders happen while the component is not mounted
  useEffect(() => {
    if (isMounted.current) {
      const connect = () => {
        if (!ready) {
          if (checkParams(roomName, username, setError, dispatch)) {
            dispatch(joinRoomSocket({
              roomName,
              username,
            }));
          }
        }
        // check if user is allowed to access this room
        dispatch(checkRoomSocket({
          roomName,
          username,
        }, setChecked));
      };
      connect();

      socket.on('reconnect', () => {
        connect();
        setServerStatus(true);
      });

      socket.on('connect_error', () => {
        setServerStatus(false);
      });
    }
    return (() => {
      isMounted.current = false;
    });
  }, []);

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

  if (isAdmin === null) {
    users.forEach((user) => {
      if (username === user.name) {
        setIsAdmin(user.isAdmin);
      }
    });
  }

  useInterval(() => {
    if (serverStatus) {
      drop();
    }
  }, dropTime);

  if (!serverStatus) {
    return <Loader />;
  }
  if (checked === null) {
    return <></>;
  }

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
                  <Lobby users={users} />
                </div>
              )}
            { isAdmin && gameStatus !== 1
              && <StartButton cb={() => dispatch({ type: 'START_GAME' })} />}
          </aside>
        </StyledTetris>
      )}
    </StyledTetrisWrapper>
  );
}

export default Tetris;
