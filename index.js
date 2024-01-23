const express = require("express");
const bodyParser = require("body-parser");
const JsonDB = require("node-json-db").JsonDB;
const Config = require("node-json-db/dist/lib/JsonDBConfig").Config;
const uuid = require("uuid");
const speakeasy = require("speakeasy");

const app = express();

// Setup DB
const dbConfig = new Config("myDB", true, true, "/");
const db = new JsonDB(dbConfig);

// Register body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// APIs
app.get("/ping", (req, res) => {
  res.json("It is working fine!");
});

app.get("/register", (req, res) => {
  const id = uuid.v4();
  const userDBPath = `/users/${id}`;
  try {
    const tempSecret = speakeasy.generateSecret();
    const user = { id, tempSecret };
    db.push(userDBPath, user);
    res.status(201).json({ id, secret: tempSecret.base32 });
  } catch (error) {
    console.log(error)
    res.status(500).json("Error: failed to register user!");
  }
});

app.post("/verify", async (req, res) => {
  const { id, token } = req.body;
  const userDBPath = `/users/${id}`;
  try {
    const user = await db.getData(userDBPath);
    const isValid = speakeasy.totp.verify({
      secret: user.tempSecret.base32,
      encoding: "base32",
      token,
    });

    if (isValid === false) {
      return res.json({
        verified: false,
        message: "Failed to verify user, try again!",
      });
    }
    // Update user to use this tempSecret as the permanent secret
    db.push(userDBPath, { id: user.id, secret: user.tempSecret });
    res.json({ verified: true });
  } catch (error) {
    console.log(error)
    res.status(500).json("Error: failed to verify user!");
  }
});

app.post("/validate", async (req, res) => {
  const { id, token } = req.body;
  const userDBPath = `/users/${id}`;
  try {
    const user = await db.getData(userDBPath);
    const isValid = speakeasy.totp.verify({
      secret: user.secret.base32,
      encoding: "base32",
      token,
      window: 1,
    });

    if (isValid === false) {
      res.json({ isValid: false });
    } else {
      res.json({ isValid: true });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json("Error: failed to validate user!");
  }
});

// Start app
const PORT = 9000;
app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}`);
});
