const MatchManager = require("./managers/MatchManager");
const ModeResolver = require("../modules/ModeResolver");
const QueueManager = require("../modules/QueueManager");
const MatchController = require("../modules/MatchController");
const MatchLifecycle = require("../modules/MatchLifecycle");
const GameState = require("./GameState");


class CoreAdapter {

    constructor(room) {

        this.room = room;

        this.modeResolver = new ModeResolver();
        this.queueManager = new QueueManager();
        this.matchController = new MatchController(room);
        this.matchLifecycle = new MatchLifecycle(room);
        this.matchManager = new MatchManager(this.room);

        this.init();
    }

    init() {

        this.room.onPlayerJoin = (player) => {

            console.log("Jugador conectado:", player.name);

            this.queueManager.addPlayer(player);

            const total = this.room.getPlayerList().length;

            const result = this.modeResolver.resolve(total);

            GameState.currentMode = result.mode;

            if (result.changed) {
                console.log("Cambio de modo:", result.mode);
            }

            this.matchController.assignTeams();

            this.matchLifecycle.startMatch();

        };

        this.room.onPlayerLeave = (player) => {

            console.log("Jugador salió:", player.name);

            this.queueManager.removePlayer(player);

            const total = this.room.getPlayerList().length;

            const result = this.modeResolver.resolve(total);

            GameState.currentMode = result.mode;

            if (result.changed) {
                console.log("Cambio de modo:", result.mode);
            }

            this.matchController.assignTeams();

            this.matchLifecycle.startMatch();

        };

    }

}

module.exports = CoreAdapter;

