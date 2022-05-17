import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import cool from './cool.svg';
import crying from './crying.svg';
import eyeglass from './eyeglass.svg';
import sunglass from './sunglass.svg';
import './App.css';

const mineNumber = 10;
const sizeX = 8;
const sizeY = 9;
const states = ['wait', 'game', 'mine', 'win'];
let status = 'wait';
let cntOpen = 0;

function App() {
    return (
        <div className="App">
            <Game/>
        </div>
    );
}

export default App;

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 10000,
            flags: 10,
            startGame: false,
            endGame: false
        };
    }

    onReset = () => {
        cntOpen = 0;
        status = 'wait';
        this.setState({
            id: Math.floor(Math.random() * 10000),
            flags: 10,
            startGame: false,
            endGame: false
        });
    }

    flagChanged = (mark) => {
        let flg = this.state.flags;
        flg = (mark) ? flg + 1 : flg - 1;
        this.setState({flags: flg});
        this.stateChanged(true, false);
    }

    stateChanged = (start, end) => {
        this.setState((state) => {
            return {startGame: start}});
        this.setState((state) => {
            return {endGame: end}});
        this.setStatus(start, end);
        if (status === 'win') {
            this.setState((state) => {
                return {startGame: false, endGame: true}});
        }
    }

    setStatus = (start, end) => {
        if (cntOpen > 1 && end) {
            status = 'mine';
        } else if (start) {
            if (this.state.flags === 0 && cntOpen >= 62) {
                status = 'win'
            } else {
                status = 'game';
            }
        } else {
            status = 'wait';
        }
    }

    render() {
        return (
            <div className="Game" key={this.state.id}>
                <header className="App-header">
                    <p>Minesweeper</p>
                    <img src={logo} className="App-logo" alt="logo" />
                </header>
                <Controls
                    flags={this.state.flags}
                    start={this.state.startGame}
                    onHandleButton={this.onReset}
                />
                <Field
                    flags={this.state.flags}
                    cntOpen={this.state.cntOpen}
                    onFlagChange={this.flagChanged}
                    onStartGame={this.stateChanged}
                    onNewGame={this.onReset}
                    endGame={this.state.endGame}
                />
            </div>
        )
    }
}

// props: (flags, start, onHandleButton)
class Controls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {timer: 0};
    }

    render() {
        return (
            <div className="Panel">
                <p className="FlagsCounter">{this.props.flags}</p>
                <ResetBtn onHandleButton={this.props.onHandleButton}/>
                <Timer start={this.props.start}/>
            </div>
        );
    }
}

// props: (flags, onFlagChange, onStartGame, endGame)
class Field extends React.Component {
    constructor(props) {
        super(props);
        this.state={ iCell: -1, data: this.mines() }
        view2d(this.state.data);
    }

    handleClick = (v) => {
        const idx = v;
        const cell = this.state.data[idx];
        if (cntOpen === 0 && cell === 'X') {
            // don't start game with a mine
            this.props.onNewGame();
        } else {
            const end = this.props.endGame || cell === 'X';
            const start = idx >= 0 && !end;
            if (cell === '.') {
                openCells(idx, this.state.data);
                view2d(this.state.data);
            } else {
                cntOpen++;
            }
            this.props.onStartGame(start, end);
        }
    }

    handleRClick = (mark) => {
        if (this.props.flags > 0) {
            this.props.onFlagChange(mark);
        }
    }

    render() {
        const cells = this.state.data.map((cell, idx) =>
            <Cell key={idx}
                  cell={cell}
                  iCell={idx}
                  onCellClick={this.handleClick}
                  onSetMark={this.handleRClick}
                  endGame={this.props.endGame}
                  flags={this.props.flags}
            />);
        return (
            <div className="Field">
                {cells}
            </div>
        )
    }

    mines() {
        const n = sizeX * sizeY;
        const arr = Array(n).fill('.')
        let cnt = mineNumber;
        while (cnt) {
            let i = Math.floor(Math.random() * n);
            if (arr[i] !== 'X') {
                arr[i] = 'X';
                cnt--;
            }
        }
        this.cntMines(arr);
        return arr;
    }

    cntMines(arr) {
        arr.forEach( (cell, idx, arr) => {
            if (cell !== 'X') {
                let n = this.cntNeighbors(idx, arr);
                if (n > 0) {
                    arr[idx] = parseInt(n);
                }
            }
        });
    }

    cntNeighbors(iCell, arr) {
        let cnt = 0
        let r = Math.trunc(iCell / sizeX);
        let c = iCell % sizeX;

        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                if (0 <= i && i < sizeY && 0 <= j && j < sizeX) {
                    let k = i * sizeX + j;
                    if (arr[k] === 'X') {
                        cnt++;
                    }
                }
            }
        }
        return cnt
    }
}

// props: (cell, iCell, onCellClick, onSetMark, endGame)
class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isClosed: true,
            isMarked: false,
            isMined: props.cell === 'X'
        }
    }

    handleClick = () => {
        if (!this.state.isMarked) {
            this.setState(prev => ({
                isClosed: false
            }));
            this.props.onCellClick(this.props.iCell);
        }
    }

    handleRClick = (e) => {
        e.preventDefault();
        if (this.props.flags > 0 && this.state.isClosed) {
            this.setState(prev => ({
                isMarked: !prev.isMarked
            }));
            this.props.onSetMark(this.state.isMarked);
        }
    }

    render() {
        const value = this.props.cell;
        const isOpen = this.props.cell <= 0
            || this.props.endGame && this.props.cell === 'X';

        if (isOpen && this.state.isClosed) {
            this.setState({isClosed: false});
        }
        let cls = "cell";
        if (!this.state.isClosed || isOpen) {
            cls += " cell-open"
            if (this.state.isMined) {
                cls += " cell-mine"
            }
        } else if (this.state.isMarked && !this.props.endGame) {
            cls += " cell-mark"
        }
        return (
            <div className={cls}
                 onClick={this.handleClick}
                 onContextMenu={this.handleRClick}>
                { this.state.isClosed || value === 0 || isNaN(value)
                    ? '' : Math.abs(parseInt(this.props.cell))
                }
            </div>
        )
    }
}

function view2d(arr) {
    // 1d --> 2d
    const arr1 = [].concat(...arr);
    const arr2 = [];
    while (arr1.length) arr2.push(arr1.splice(0, sizeX));
    console.log(arr2);
}

function openCells(idx, arr) {
    if (arr[idx] === '.') {
        arr[idx] = 0;
        cntOpen++;
        let r = Math.trunc(idx / sizeX);
        let c = idx % sizeX;
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                if (0 <= i && i < sizeY && 0 <= j && j < sizeX) {
                    let k = i * sizeX + j;
                    if (k !== idx && (arr[k] > 0 && arr[k] < 9)) {
                        arr[k] = -arr[k];
                        cntOpen++;
                    }
                    if (k !== idx && (arr[k] === '.')) {
                        openCells(k, arr);
                    }
                }
            }
        }
    } else {
        return 0;
    }
}

const Timer = (props) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    if (props.start && !isActive) {
        setIsActive(true);
    }
    if (!props.start && isActive) {
        setIsActive(false);
    }

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    let m = Math.trunc(seconds / 60);
    let s = seconds % 60;
    return (
        <p className="Timer">{`${m}:${s > 9 ? s : '0' + s}`}</p>
    )
}

const ResetBtn = (props) => {
    let img = (status === 'wait') ? sunglass :
        (status === 'game') ? eyeglass :
            (status === 'mine') ? crying : cool;

    return (
        <button className="Reset"
                onClick={props.onHandleButton}><img src={img} /></button>
    )
}

