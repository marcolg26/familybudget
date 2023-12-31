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
    console.log(`/api/budget/`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const budget = await database.collection("expenses").find({ "user": req.session.username }).toArray();
    res.json(budget);

});

app.get('/api/budget/:year', check, async (req, res) => {
    console.log(`/api/budget/:year`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const budget = await database.collection("expenses").find({ "user": req.session.username, "date": { "$gte": new Date('2023-01-01'), "$lt": new Date("2024-01-01") } }).toArray();
    res.json(budget);

});

app.get('/api/budget/search/:query', check, async (req, res) => { //*** 
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    console.log(`/api/budget/search/:query`);
    const results = await database.collection("expenses").find({ "description": { "$regex": req.params.query, "$options": "i" } }).toArray();
    res.json(results);

});

app.get('/api/budget/:year/:month', check, (req, res) => {
    console.log(`/api/budget/:year/:month`);
    res.json(req.session.user);

});

app.get('/api/budget/:year/:month/:id', check, (req, res) => {
    console.log(`/api/budget/:year/:month/:id`);
    res.json(req.session.user);

});

app.post('/api/budget/:year/:month', check, (req, res) => {
    res.json(req.session.user);

});

app.put('/api/budget/:year/:month/:id', check, (req, res) => {
    res.json(req.session.user);

});

app.delete('/api/budget/id', check, async (req, res) => { //aggiungere year e month
    console.log(`/api/budget/id`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const result = await database.collection("expenses").deleteOne({ "_id": req.body.id });
    res.json(req.session.user);


});

app.get('/api/balance', check, async (req, res) => {
    console.log(`/api/balance`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const result = await database.collection("expenses").aggregate([ //si può semplificare?
        {
            '$match': {
                'user': 'marcolg'
            }
        }, {
            '$group': {
                '_id': null,
                'total': {
                    '$sum': '$price'
                }
            }
        }, {
            '$project': {
                '_id': 0,
                'total': 1
            }
        }
    ]).toArray();

    res.json(result); //devo restituire il risultato in json o solo il numero?

});

app.get('/api/balance/:id', check, (req, res) => {
    console.log(`/api/balance/:id`);
    res.json(req.session.user);

});

app.get('/api/budget/whoami', check, (req, res) => {
    res.json(req.session.username);

});

app.get('/api/users/search/:query', check, async (req, res) => { //eliminare password
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    console.log(`/api/users/search/:query`);
    console.log(req.params.query);
    const results = await database.collection("users").find({ "username": { "$regex": req.params.query, "$options": "i" } }).toArray();
    res.json(results);

});