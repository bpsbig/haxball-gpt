class MatchManager {

    constructor(room) {
        this.room = room;
        this.matchActive = false;
    }

    startMatch(redTeam, blueTeam) {

        this.matchActive = true;

        // limpiar equipos
        this.room.getPlayerList().forEach(player => {
            this.room.setPlayerTeam(player.id, 0);
        });

        // asignar red
        redTeam.forEach(player => {
            this.room.setPlayerTeam(player.id, 1);
        });

        // asignar blue
        blueTeam.forEach(player => {
            this.room.setPlayerTeam(player.id, 2);
        });

        this.room.startGame();
    }

    endMatch() {
        this.matchActive = false;
        this.room.stopGame();
    }

}

module.exports = MatchManager;
