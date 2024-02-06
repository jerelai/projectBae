const express = require("express");
// const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const cors = require("cors");
const config = require("./config");

const { Server } = require("socket.io");
const app = express();
const httpserver = require('http').Server(app);
const io = new Server(httpserver, {
  cors: {
    origin: '*'
  }
})
const SocketIO = require('./socket');
SocketIO(io);

// const MONGODB_URL = config.MONGODB_URL;
const PORT = config.PORT;

// mongoose.connect(MONGODB_URL, {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
// });
// mongoose.connection.on("connected", () => {
//   console.log("Connected to MongoDB on ", MONGODB_URL);
// });
// mongoose.connection.on("error", (error) => {
//   console.log(error);
// });

app.use(cors());
// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "client/build")));
app.use(
  "/assets/images",
  express.static(path.join(__dirname, "assets/images"))
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build/index.html"));
});

httpserver.listen(PORT, () => console.log(`==========>Started server at ${PORT}`));


