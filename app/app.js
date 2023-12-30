const express = require("express");
const session = require('express-session');

const app = express();
const port = 3002;

const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";

app.use(express.static(`${__dirname}/pages`));
app.use(express.urlencoded());
app.use(session({ secret: 'xx', resave: false })); //!!


app.get("/test", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

app.post("/api/auth/signin", async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const user = await database.collection("users").findOne({ username: req.body.username });

    if (user) {
        if (user.password === req.body.password) {
            req.session.user = user;
            req.session.username = req.body.username;
            res.send("ok");
            //res.redirect('home.html');
        } else {
            res.send("credenziali errate");
        }
    }
    else res.status(400).send("utente non esistente");
});

function check(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send("utente non autenticato");
    }
}

app.get('/api/budget/', check, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const budget = await database.collection("expenses").find({ "user": req.session.username }).toArray();
    res.json(budget);

});

app.get('/api/budget/:year', check, async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const budget = await database.collection("expenses").find({ "user": req.session.username, "date": { "$gte": new Date("2023-01-01"), "$lt": new Date("2024-01-01") } }).toArray();
    res.json(budget);

});

app.get('/api/budget/:year/:month', check, (req, res) => {
    res.json(req.session.user);

});

app.get('/api/budget/:year/:month/:id', check, (req, res) => {
    res.json(req.session.user);

});

app.post('/api/budget/:year/:month', check, (req, res) => {
    res.json(req.session.user);

});

app.put('/api/budget/:year/:month/:id', check, (req, res) => {
    res.json(req.session.user);

});

app.delete('/api/budget/:year/:month/:id', check, (req, res) => {
    res.json(req.session.user);

});

app.get('/api/balance', check, (req, res) => {
    res.json(req.session.user);

});

app.get('/api/balance/:id', check, (req, res) => {
    res.json(req.session.user);

});

app.get('/api/budget/search?q=query', check, (req, res) => {
    res.json(req.session.user);

});

app.get('/api/budget/whoami', check, (req, res) => {
    res.json(req.session.username);

});

app.get('/api/users/search?q=query', check, (req, res) => {
    res.json(req.session.user);

});