const GameState = require("../core/GameState");

class MatchLifecycle {

    constructor(room) {
        this.room = room;
    }

    startMatch() {

        if (GameState.matchActive) return;

        const red = GameState.teams.red.length;
        const blue = GameState.teams.blue.length;

        if (red > 0 && red === blue) {

            console.log("Partido iniciado");

            GameState.matchActive = true;

            this.room.startGame();
        }
    }

    pauseMatch() {

        if (!GameState.matchActive) return;

        console.log("Partido pausado");

        this.room.pauseGame(true);
    }

    resumeMatch() {

        if (!GameState.matchActive) return;

        console.log("Partido reanudado");

        this.room.pauseGame(false);
    }

    endMatch() {

        if (!GameState.matchActive) return;

        console.log("Partido terminado");

        GameState.matchActive = false;

        this.room.stopGame();
    }

}

module.exports = MatchLifecycle;
