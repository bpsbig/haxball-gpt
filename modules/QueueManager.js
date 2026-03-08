const GameState = require("../core/GameState");

class QueueManager {

    constructor(room) {
        this.room = room;
    }

    addPlayer(player) {

        if (!GameState.queue.includes(player.id)) {
            GameState.queue.push(player.id);
        }

        console.log("Cola actual:", GameState.queue);

    }

    removePlayer(player) {

        GameState.queue = GameState.queue.filter(id => id !== player.id);

        console.log("Cola actual:", GameState.queue);

    }

    getQueue() {
        return GameState.queue;
    }

    getQueueSize() {
        return GameState.queue.length;
    }

}

module.exports = QueueManager;
