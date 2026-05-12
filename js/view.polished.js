"use strict";

//TODO: Think of this view as your game board.
//      Your view should listen to various custom events of your model.
//      For each event of your model, there should be a clear visual
//      representation of what's going on.

//TODO: Update the field. Show the whole battlefield with all the stones
//      that are already played.

//TODO: Show the current player

//TODO: Notify the player when the game is over. Make it clear how the
//      Game ended. If it's a win, show the winning stones.

const ConnectFourPolishedView = {
    rows: 5,
    columns: 7,

    events: {
        characterSelected: "connectfour-view:character-selected",
        columnSelected: "connectfour-view:column-selected",
        restartRequested: "connectfour-view:restart-requested"
    },

    assets: {
        board: "images/connect4board.png",
        coins: {
            1: "images/coins/CoinPlayer1.png",
            2: "images/coins/CoinPlayer2.png",
            win: "images/coins/CoinWin.png"
        },
        characters: [
            {
                id: "bugs-bunny",
                name: "Bugs Bunny",
                image: "images/characters/BugsBunny.png"
            },
            {
                id: "lola-bunny",
                name: "Lola Bunny",
                image: "images/characters/LolaBunny.png"
            },
            {
                id: "sylvester",
                name: "Sylvester",
                image: "images/characters/Sylvester.png"
            },
            {
                id: "tweety",
                name: "Tweety",
                image: "images/characters/Tweety.png"
            },
            {
                id: "daffy-duck",
                name: "Daffy Duck",
                image: "images/characters/DaffyDuck.png"
            },
            {
                id: "road-runner",
                name: "Road Runner",
                image: "images/characters/RoadRunner.png"
            },
            {
                id: "wile-e-coyote",
                name: "Wile E. Coyote",
                image: "images/characters/WileECoyote.webp"
            },
            {
                id: "taz",
                name: "Taz",
                image: "images/characters/Taz.png"
            }
        ]
    },

    dom: {},
    pickedCharacters: [null, null],
    pickingPlayerIndex: 0,
    gameStarted: false,

    init(model) {
        this.model = model;
        this.cacheDom();
        this.renderCharacterPicker();
        this.renderEmptyBoard();
        this.renderColumnControls();
        this.bindDomEvents();
        this.bindModelEvents();
    },

    cacheDom() {
        this.dom.characterSelection = document.querySelector("#characterSelection");
        this.dom.characterGridTop = document.querySelector("#characterGridTop");
        this.dom.characterGridBottom = document.querySelector("#characterGridBottom");
        this.dom.selectionStep = document.querySelector("#selectionStep");

        this.dom.gameArea = document.querySelector("#gameArea");
        this.dom.coinGrid = document.querySelector("#coinGrid");
        this.dom.columnControls = document.querySelector("#columnControls");
        this.dom.statusBar = document.querySelector("#statusBar");
        this.dom.restartButton = document.querySelector("#restartButton");

        this.dom.playerOnePanel = document.querySelector(".player-one-panel");
        this.dom.playerTwoPanel = document.querySelector(".player-two-panel");
        this.dom.playerOneCharacter = document.querySelector("#playerOneCharacter");
        this.dom.playerTwoCharacter = document.querySelector("#playerTwoCharacter");
        this.dom.playerOneName = document.querySelector("#playerOneName");
        this.dom.playerTwoName = document.querySelector("#playerTwoName");
    },

    renderCharacterPicker() {
        this.dom.characterGridTop.innerHTML = "";
        this.dom.characterGridBottom.innerHTML = "";

        this.assets.characters.forEach((character, index) => {
            const button = document.createElement("button");
            button.className = "character-button";
            button.type = "button";
            button.dataset.characterId = character.id;

            const image = document.createElement("img");
            image.src = character.image;
            image.alt = character.name;

            const label = document.createElement("span");
            label.textContent = character.name;

            button.append(image, label);

            if (this.pickedCharacters[0]?.id === character.id && this.pickingPlayerIndex === 1) {
                button.disabled = true;
                button.title = "Player 1 already chose this character.";
            }

            if (index < 4) {
                this.dom.characterGridTop.append(button);
            } else {
                this.dom.characterGridBottom.append(button);
            }
        });
    },

    renderEmptyBoard() {
        this.dom.coinGrid.innerHTML = "";

        for (let row = 0; row < this.rows; row += 1) {
            for (let column = 0; column < this.columns; column += 1) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.row = String(row);
                cell.dataset.column = String(column);
                this.dom.coinGrid.append(cell);
            }
        }
    },

    renderColumnControls() {
        this.dom.columnControls.innerHTML = "";

        for (let row = 0; row < this.rows; row += 1) {
            for (let column = 0; column < this.columns; column += 1) {
                const button = document.createElement("button");
                button.className = "column-button";
                button.type = "button";
                button.dataset.column = String(column);
                button.setAttribute("aria-label", `Drop coin in column ${column + 1}`);
                this.dom.columnControls.append(button);
            }
        }
    },

    bindDomEvents() {
        this.dom.characterSelection.addEventListener("click", (event) => {
            const button = event.target.closest(".character-button");

            if (button === null || button.disabled) {
                return;
            }

            const character = this.findCharacterById(button.dataset.characterId);

            if (character === null) {
                return;
            }

            document.dispatchEvent(new CustomEvent(this.events.characterSelected, {
                detail: {
                    playerIndex: this.pickingPlayerIndex,
                    character
                }
            }));
        });

        this.dom.columnControls.addEventListener("click", (event) => {
            const button = event.target.closest(".column-button");

            if (button === null || !this.gameStarted) {
                return;
            }

            document.dispatchEvent(new CustomEvent(this.events.columnSelected, {
                detail: {
                    column: Number(button.dataset.column)
                }
            }));
        });

        this.dom.restartButton.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent(this.events.restartRequested));
        });
    },

    bindModelEvents() {
        document.addEventListener(this.model.events.playerChanged, (event) => {
            this.showCurrentPlayer(event.detail.currentPlayer);
        });

        document.addEventListener(this.model.events.stoneInserted, (event) => {
            this.updateField(event.detail.battlefield, event.detail.winningStones);
        });

        document.addEventListener(this.model.events.gameOver, (event) => {
            this.showGameOver(event.detail);
        });

        document.addEventListener(this.model.events.invalidMove, (event) => {
            this.showWarning(event.detail.message);
        });
    },

    selectCharacter(playerIndex, character) {
        this.pickedCharacters[playerIndex] = character;

        if (playerIndex === 0) {
            this.pickingPlayerIndex = 1;
            this.dom.selectionStep.textContent = "Player 2, pick your character";
            this.renderCharacterPicker();
            return;
        }

        this.startGame();
    },

    startGame() {
        this.gameStarted = true;

        this.dom.characterSelection.classList.add("is-hidden");
        this.dom.gameArea.classList.remove("is-hidden");

        this.dom.playerOneCharacter.src = this.pickedCharacters[0].image;
        this.dom.playerOneCharacter.alt = this.pickedCharacters[0].name;
        this.dom.playerOneName.textContent = this.pickedCharacters[0].name;

        this.dom.playerTwoCharacter.src = this.pickedCharacters[1].image;
        this.dom.playerTwoCharacter.alt = this.pickedCharacters[1].name;
        this.dom.playerTwoName.textContent = this.pickedCharacters[1].name;
    },

    resetSelection() {
        this.pickedCharacters = [null, null];
        this.pickingPlayerIndex = 0;
        this.gameStarted = false;

        this.dom.selectionStep.textContent = "Player 1, pick your character";
        this.dom.statusBar.className = "status-bar";
        this.dom.statusBar.textContent = "Choose your characters to start.";

        this.dom.gameArea.classList.add("is-hidden");
        this.dom.characterSelection.classList.remove("is-hidden");

        this.dom.playerOnePanel.classList.remove("is-active");
        this.dom.playerTwoPanel.classList.remove("is-active");

        this.renderCharacterPicker();
        this.renderEmptyBoard();
    },

    updateField(battlefield, winningStones = []) {
        battlefield.forEach((rowData, row) => {
            rowData.forEach((stone, column) => {
                const cell = this.getCell(row, column);
                let coin = cell.querySelector(".coin");

                if (stone === null) {
                    if (coin !== null) {
                        coin.remove();
                    }

                    return;
                }

                const isWinning = this.isWinningStone(row, column, winningStones);

                if (coin === null) {
                    coin = document.createElement("img");
                    coin.className = "coin";
                    cell.append(coin);
                }

                if (isWinning) {
                    coin.classList.add("winning");
                    coin.src = this.assets.coins.win;
                    coin.alt = "Winning coin";
                } else {
                    coin.classList.remove("winning");
                    coin.src = this.assets.coins[stone.playerId];
                    coin.alt = `Player ${stone.playerId} coin`;
                }
            });
        });
    },

    showCurrentPlayer(currentPlayer) {
        if (!this.gameStarted) {
            return;
        }

        this.dom.statusBar.className = "status-bar";
        this.dom.statusBar.textContent = `${currentPlayer.character.name}'s turn`;

        this.dom.playerOnePanel.classList.toggle("is-active", currentPlayer.id === 1);
        this.dom.playerTwoPanel.classList.toggle("is-active", currentPlayer.id === 2);
    },

    showWarning(message) {
        this.dom.statusBar.textContent = message;
        this.dom.statusBar.className = "status-bar warning";

        window.setTimeout(() => {
            if (!this.model.gameOver) {
                this.showCurrentPlayer(this.model.getCurrentPlayer());
            }
        }, 1200);
    },

    showGameOver(detail) {
        this.dom.playerOnePanel.classList.remove("is-active");
        this.dom.playerTwoPanel.classList.remove("is-active");

        if (detail.reason === "draw") {
            this.dom.statusBar.className = "status-bar win";
            this.dom.statusBar.textContent = "Draw! The board is full.";
            return;
        }

        this.dom.statusBar.className = "status-bar win";
        this.dom.statusBar.textContent = `${detail.winner.character.name} wins!`;
        this.updateField(detail.battlefield, detail.winningStones);

        if (detail.winner.id === 1) {
            this.dom.playerOnePanel.classList.add("is-active");
        } else {
            this.dom.playerTwoPanel.classList.add("is-active");
        }
    },

    getCell(row, column) {
        return this.dom.coinGrid.querySelector(`[data-row="${row}"][data-column="${column}"]`);
    },

    isWinningStone(row, column, winningStones) {
        return winningStones.some((stone) => {
            return stone.row === row && stone.column === column;
        });
    },

    findCharacterById(characterId) {
        return this.assets.characters.find((character) => {
            return character.id === characterId;
        }) ?? null;
    }
};