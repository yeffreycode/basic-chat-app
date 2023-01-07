const httpServer = require("./app");
const config = require("./config");
httpServer.listen(config.port, () => console.log("server running on port 4000"));
