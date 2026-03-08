// modules/MatchController.js
const GameState = require("../core/GameState");

class MatchController {
    constructor(room) {
        this.room = room;
    }

    assignTeams() {
        const mode = GameState.currentMode;
        const queue = GameState.queue;

        // Limpiar equipos antes de asignar
        GameState.teams.red = [];
        GameState.teams.blue = [];
        GameState.captains.red = null;
        GameState.captains.blue = null;

        if (mode === "WAIT") return;

        let neededPlayers = 0;
        if (mode === "1v1") neededPlayers = 2;
        if (mode === "2v2") neededPlayers = 4;
        if (mode === "3v3") neededPlayers = 6;

        const activePlayers = queue.slice(0, neededPlayers);

        // Asignar Red y Blue
        const half = Math.ceil(activePlayers.length / 2);
        GameState.teams.red = activePlayers.slice(0, half);
        GameState.teams.blue = activePlayers.slice(half, activePlayers.length);

        // Capitanes: primero de cada equipo
        GameState.captains.red = GameState.teams.red[0] || null;
        GameState.captains.blue = GameState.teams.blue[0] || null;

        // Log para verificar
        console.log("Equipos asignados:");
        console.log("Red:", GameState.teams.red);
        console.log("Blue:", GameState.teams.blue);

        // Actualizar estado de los jugadores en la sala
        this.updateRoomTeams();
    }

    updateRoomTeams() {
        const allPlayers = this.room.getPlayerList();

        allPlayers.forEach(player => {
            if (GameState.teams.red.includes(player.id)) {
                this.room.setPlayerTeam(player.id, 1); // Red
            } else if (GameState.teams.blue.includes(player.id)) {
                this.room.setPlayerTeam(player.id, 2); // Blue
            } else {
                this.room.setPlayerTeam(player.id, 0); // Spectator
            }
        });
    }
}

module.exports = MatchController;
