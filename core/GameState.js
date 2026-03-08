// core/GameState.js
class GameState {
    constructor() {
        this.players = [];   // Todos los jugadores conectados
        this.queue = [];     // Cola FIFO
        this.currentMode = "WAIT";

        this.teams = {       // Equipos activos
            red: [],
            blue: []
        };

        this.captains = {    // Capitanes por equipo
            red: null,
            blue: null
        };

        this.score = {       // Marcador
            red: 0,
            blue: 0
        };

        this.matchActive = false; // NUEVO (Fase 3)
    }
}

module.exports = new GameState();

