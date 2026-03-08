class ModeResolver {

    resolve(playerCount) {

        if (playerCount <= 1) {
            return {
                mode: "WAIT",
                teamSize: 0
            };
        }

        if (playerCount <= 3) {
            return {
                mode: "1v1",
                teamSize: 1
            };
        }

        if (playerCount <= 5) {
            return {
                mode: "2v2",
                teamSize: 2
            };
        }

        return {
            mode: "3v3",
            teamSize: 3
        };
    }

}

module.exports = ModeResolver;
