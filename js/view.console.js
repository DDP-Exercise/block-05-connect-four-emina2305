"use strict";

//TODO: Optional: Create a console-view to test your Game.

const ConnectFourConsoleView = {
    init(model) {
        document.addEventListener(model.events.playerChanged, (event) => {
            console.info("[Connect Four] Current player:", event.detail.currentPlayer.name);
        });

        document.addEventListener(model.events.stoneInserted, (event) => {
            console.table(event.detail.battlefield.map((row) => {
                return row.map((cell) => {
                    return cell === null ? "." : cell.playerId;
                });
            }));
        });

        document.addEventListener(model.events.gameOver, (event) => {
            if (event.detail.reason === "draw") {
                console.info("[Connect Four] Game over: draw.");
                return;
            }

            console.info("[Connect Four] Winner:", event.detail.winner.name);
            console.info("[Connect Four] Winning stones:", event.detail.winningStones);
        });

        document.addEventListener(model.events.invalidMove, (event) => {
            console.warn("[Connect Four] Invalid move:", event.detail.message);
        });
    }
};