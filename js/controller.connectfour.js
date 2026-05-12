"use strict";

/*******************************************************
 *     Connect Four - 100p
 *
 *     It's gaming time! The kids from Kindergarten would
 *     love to play some connect four! Unfortunately, kids
 *     nowadays can't use any wood or paper games anymore.
 *     It's digital or they go crazy. And we don't want crazy,
 *     do we?
 *
 *     Your task is to create a nice game of connect four.
 *     Make it an interesting >digital product< (I've heard
 *     you are an expert for that)! Make it visually appealing.
 *     Wrap it into a story. Choose or create two characters
 *     with rivalry to give your game more flesh. Try to
 *     match the appearance and/or the behavior of the game to
 *     the background-story (character arch).
 *
 *     Technical requirements:
 *     The game should be intuitive to play. It's a children's
 *     game after all. Think of a good way to handle your input.
 *
 *     The two players use the same input method and play in turns
 *     (= No need for separate input).
 *
 *     The game should give some hint or warning, when a player
 *     wants to put a stone on a file that is already full.
 *
 *     The game should give a clear visual representation of
 *     the winning stones and announce the winner.
 *
 *     Use MVC and custom Events. The model dispatches events for:
 *      - Player Change (view visually highlights current player)
 *      - Stone was inserted (view visually represents all the stones)
 *      - Game is over (Draw or Winner)
 *
 *     The creation of this game should take you somewhere between
 *     8-10 hours of concentrated work.
 *     Bratlsoft - 2026-04-29
 *******************************************************/


//TODO: Create your controller-object. When initiated, it should boot
//      the view (or views, if you decide to make a console-view).

//TODO: Add EventListeners, to forward the user inputs to the model.

const ConnectFourController = {
    init() {
        ConnectFourPolishedView.init(ConnectFourModel);
        ConnectFourConsoleView.init(ConnectFourModel);
        this.bindViewEvents();
    },

    bindViewEvents() {
        document.addEventListener(ConnectFourPolishedView.events.characterSelected, (event) => {
            const { playerIndex, character } = event.detail;
            ConnectFourPolishedView.selectCharacter(playerIndex, character);

            if (ConnectFourPolishedView.pickedCharacters[0] !== null && ConnectFourPolishedView.pickedCharacters[1] !== null) {
                ConnectFourModel.setPlayers(
                    ConnectFourPolishedView.pickedCharacters[0],
                    ConnectFourPolishedView.pickedCharacters[1]
                );
            }
        });

        document.addEventListener(ConnectFourPolishedView.events.columnSelected, (event) => {
            ConnectFourModel.insertStone(event.detail.column);
        });

        document.addEventListener(ConnectFourPolishedView.events.restartRequested, () => {
            ConnectFourPolishedView.resetSelection();
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    ConnectFourController.init();
});