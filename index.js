const express = require('express')
const bodyParser = require('body-parser')
const JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;
const uuid = require('uuid')
const speakeasy = require('speakeasy')

const app = express()

// Setup DB
const dbConfig = new Config("myDB", true, true, '/')
const db = new JsonDB(dbConfig)

// Register body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// APIs
app.get('/ping', (req, res) => {
    res.json('It is working fine!')
})

// Start app
const PORT = 9000
app.listen(PORT, () => {
    console.log(`Listening on PORT:${PORT}`)
})