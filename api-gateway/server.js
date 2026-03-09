require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/database");

const app = express();
const devicesRouter = require("./src/routes/devices");
const messagesRouter = require("./src/routes/messages");
const engineRouter = require("./src/routes/engine");
const broadcastRouter = require("./src/routes/broadcast");
const webhookRouter = require("./src/routes/webhook");
const authRouter = require("./src/routes/auth");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "WAHA",
    version: "1.0",
    status: "running",
  });
});

app.use("/devices", devicesRouter);
app.use("/messages", messagesRouter);
app.use("/engine", engineRouter);
app.use("/broadcast", broadcastRouter);
app.use("/webhook", webhookRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => {
    console.log(`WAHA API running on port ${PORT}`);
  });
});
