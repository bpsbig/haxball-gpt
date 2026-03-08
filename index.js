const HaxballJS = require("haxball.js").default;
const CoreAdapter = require("./core/CoreAdapter");

const HB_TOKEN = "thr1.AAAAAGmr8HRmoksaXJgCiQ.b5_i0K1MYKg";

HaxballJS().then((HBInit) => {

  const room = HBInit({
    token: HB_TOKEN,
    roomName: "test",
    maxPlayers: 12,
    public: true,
    noPlayer: true
  });

  console.log("Sala iniciada correctamente.");

  new CoreAdapter(room);

}).catch(err => {
  console.error("Error iniciando la sala:", err);
});

