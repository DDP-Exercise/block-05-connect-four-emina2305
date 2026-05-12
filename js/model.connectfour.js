"use strict";

//TODO: Think of this model as the game-logic.
//      The model knows everything that is neccessary to manage
//      the game. It knows the players, know who's turn it is,
//      knows all the stones and where they are, knows if the
//      game is over and if so, why (draw or winner). It knows
//      which stones are the winning stones. The model also has
//      sovereignty over the battlefield.
//      First step: Create your model-object with all the properties
//      necessary to store that information.

//TODO: Prepare some customEvents. The model should dispatch events when
//      - The Player Changes
//      - A stone was inserted
//      - The Game is over (Draw or Winner)
//      Don't forget to give your events a namespace.
//      For each customEvent, just make a >method< for your model-object,
//      that, when called, dispatches the event. Nothing else should
//      happen in those methods.


//TODO: Initiate the battlefield. Your model needs a representation of the
//      battlefield as data (two-dimensional array). Obviously, there are
//      no stones yet in the field.

//TODO: The model should offer a method to insert a stone at a given column.
//      If the stone can be inserted, the model should insert the stone,
//      dispatch an event to let the world know that the battlefield has changed
//      and check if the game is over now.
//      Hint: This method will be called later by your controller, when the
//      user makes an according input.

//TODO: Methods to check if the game is over, either by draw or a win.
//      Let the world know in both cases what happend. If it's a win,
//      Don't forget to store the winning stones and add this >detail<
//      to your custom event.

//TODO: Method to change the current player (and dispatch the according event).

const ConnectFourModel = {
    rows: 5,
    columns: 7,
    stonesNeededToWin: 4,

    eventNamespace: "connectfour",

    events: {
        playerChanged: "connectfour:player-changed",
        stoneInserted: "connectfour:stone-inserted",
        gameOver: "connectfour:game-over",
        invalidMove: "connectfour:invalid-move"
    },

    players: [
        {
            id: 1,
            name: "Player 1",
            colorName: "blue",
            character: null
        },
        {
            id: 2,
            name: "Player 2",
            colorName: "red",
            character: null
        }
    ],

    currentPlayerIndex: 0,
    battlefield: [],
    gameOver: false,
    winner: null,
    winningStones: [],

    init() {
        this.currentPlayerIndex = 0;
        this.gameOver = false;
        this.winner = null;
        this.winningStones = [];
        this.createBattlefield();
        this.dispatchStoneInserted();
        this.dispatchPlayerChanged();
    },

    createBattlefield() {
        this.battlefield = Array.from({ length: this.rows }, () => {
            return Array.from({ length: this.columns }, () => null);
        });
    },

    setPlayers(playerOneCharacter, playerTwoCharacter) {
        this.players[0].character = playerOneCharacter;
        this.players[1].character = playerTwoCharacter;
        this.init();
    },

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    },

    getBattlefieldCopy() {
        return this.battlefield.map((row) => row.map((cell) => {
            return cell === null ? null : { ...cell };
        }));
    },

    dispatchPlayerChanged() {
        document.dispatchEvent(new CustomEvent(this.events.playerChanged, {
            detail: {
                currentPlayer: this.getCurrentPlayer(),
                currentPlayerIndex: this.currentPlayerIndex,
                players: this.players
            }
        }));
    },

    dispatchStoneInserted() {
        document.dispatchEvent(new CustomEvent(this.events.stoneInserted, {
            detail: {
                battlefield: this.getBattlefieldCopy(),
                winningStones: [...this.winningStones],
                players: this.players
            }
        }));
    },

    dispatchGameOver(reason) {
        document.dispatchEvent(new CustomEvent(this.events.gameOver, {
            detail: {
                reason,
                winner: this.winner,
                winningStones: [...this.winningStones],
                battlefield: this.getBattlefieldCopy(),
                players: this.players
            }
        }));
    },

    dispatchInvalidMove(column, message) {
        document.dispatchEvent(new CustomEvent(this.events.invalidMove, {
            detail: {
                column,
                message
            }
        }));
    },

    insertStone(column) {
        if (this.gameOver) {
            this.dispatchInvalidMove(column, "The game is already over. Restart to play again.");
            return false;
        }

        if (!Number.isInteger(column) || column < 0 || column >= this.columns) {
            this.dispatchInvalidMove(column, "That column does not exist.");
            return false;
        }

        const row = this.findFreeRowInColumn(column);

        if (row === -1) {
            this.dispatchInvalidMove(column, "This column is full. Choose another one.");
            return false;
        }

        const currentPlayer = this.getCurrentPlayer();

        this.battlefield[row][column] = {
            playerId: currentPlayer.id,
            playerIndex: this.currentPlayerIndex,
            colorName: currentPlayer.colorName
        };

        this.winningStones = this.findWinningStones(row, column);
        this.dispatchStoneInserted();

        if (this.winningStones.length >= this.stonesNeededToWin) {
            this.gameOver = true;
            this.winner = currentPlayer;
            this.dispatchGameOver("winner");
            return true;
        }

        if (this.isDraw()) {
            this.gameOver = true;
            this.winner = null;
            this.dispatchGameOver("draw");
            return true;
        }

        this.changeCurrentPlayer();
        return true;
    },

    findFreeRowInColumn(column) {
        for (let row = this.rows - 1; row >= 0; row -= 1) {
            if (this.battlefield[row][column] === null) {
                return row;
            }
        }

        return -1;
    },

    findWinningStones(startRow, startColumn) {
        const stone = this.battlefield[startRow][startColumn];

        if (stone === null) {
            return [];
        }

        const directions = [
            { row: 0, column: 1 },
            { row: 1, column: 0 },
            { row: 1, column: 1 },
            { row: 1, column: -1 }
        ];

        for (const direction of directions) {
            const connectedStones = [
                { row: startRow, column: startColumn }
            ];

            connectedStones.push(...this.collectMatchingStones(startRow, startColumn, direction.row, direction.column, stone.playerId));
            connectedStones.push(...this.collectMatchingStones(startRow, startColumn, -direction.row, -direction.column, stone.playerId));

            if (connectedStones.length >= this.stonesNeededToWin) {
                return connectedStones;
            }
        }

        return [];
    },

    collectMatchingStones(startRow, startColumn, rowStep, columnStep, playerId) {
        const matchingStones = [];
        let row = startRow + rowStep;
        let column = startColumn + columnStep;

        while (this.isInsideBattlefield(row, column)) {
            const stone = this.battlefield[row][column];

            if (stone === null || stone.playerId !== playerId) {
                break;
            }

            matchingStones.push({ row, column });
            row += rowStep;
            column += columnStep;
        }

        return matchingStones;
    },

    isInsideBattlefield(row, column) {
        return row >= 0 && row < this.rows && column >= 0 && column < this.columns;
    },

    isDraw() {
        return this.battlefield.every((row) => {
            return row.every((cell) => cell !== null);
        });
    },

    changeCurrentPlayer() {
        this.currentPlayerIndex = this.currentPlayerIndex === 0 ? 1 : 0;
        this.dispatchPlayerChanged();
    }
};