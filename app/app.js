const express = require("express");
const session = require('express-session');

const app = express();
const port = 3002;

const { MongoClient, ObjectId } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";

app.use(express.static(`${__dirname}/pages`));

app.use(express.json());
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
            //res.send("ok");
            res.redirect('/transactions.html');
        } else {
            res.send("credenziali errate");
        }
    }
    else res.status(400).send("utente non esistente");
});

app.post("/api/auth/signup", async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    let user = {
        user: req.body.username,
        name: req.body.name,
        surname: req.body.surname,
        password: req.body.password
    };
    await database.collection("users").insertOne(user);
    res.json(user);

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

app.get('/api/users/', check, async (req, res) => { //in più
    console.log(`/api/users/`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    filter = {
        'username': {
            '$ne': req.session.username
        }
    };
    const projection = {
        'username': 1
    };

    const users = await database.collection("users").find(filter, { projection }).toArray();
    res.json(users);

});

app.get('/api/budget2/', check, async (req, res) => {
    console.log(`/api/budget2/`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    const filter = {
        'user': req.session.username
    };
    const projection = {
        'date': {
            '$dateToString': {
                'format': '%d/%m/%Y',
                'date': '$date'
            }
        },
        'price': 1,
        'description': 1,
        '_id': 1,
        'category': 1,
        'user': 1,
        'otherUsers': 1
    };
    const sort = {
        'date': -1
    };

    const budget = await database.collection("expenses").find(filter, { projection, sort }).toArray();
    res.json(budget);

});

app.get('/api/budget/:year', check, async (req, res) => {
    console.log(`/api/budget/:year`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    const year = req.params.year;
    const list = await database.collection("expenses").find({ "user": req.session.username, "date": { "$gte": new Date(`${year}-01-01`), "$lte": new Date(`${year}-12-31`) } }).toArray(); //**
    res.json(list);

});

app.get('/api/budget/search/:query', check, async (req, res) => { //*** 
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    console.log(`/api/budget/search/:query`);
    const results = await database.collection("expenses").find({ "description": { "$regex": req.params.query, "$options": "i" } }).toArray();
    res.json(results);

});

app.get('/api/budget/:year/:month', check, async (req, res) => {
    console.log(`/api/budget/:year/:month`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    const year = req.params.year;
    const month = req.params.month;
    const list = await database.collection("expenses").find({ "user": req.session.username, "date": { "$gte": new Date(`${year}-${month}-01`), "$lte": new Date(`${year}-${month}-31`) } }).toArray(); //**
    res.json(list);

});

app.get('/api/budget/:year/:month/:id', check, (req, res) => {
    console.log(`/api/budget/:year/:month/:id`);
    res.json(req.session.user);

});

app.post('/api/budget/', check, async (req, res) => { //ho tolto /:year/:month
    console.log(`post /api/budget/`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    const output = {
        user: req.session.username,
        category: req.body.category,
        description: req.body.description,
        date: new Date(),
        price: parseFloat(req.body.price),
        otherUsers: Object.entries(req.body.otherUsers).map(([user, quote]) => ({
            user: user,
            quote: quote
        }))
    };

    await database.collection("expenses").insertOne(output);
    res.json(output);

});

app.put('/api/budget/:year/:month/:id', check, (req, res) => {
    res.json(req.session.user);

});

app.delete('/api/budget/:id', check, async (req, res) => { //aggiungere year e month
    console.log(`del /api/budget/id`);
    console.log(req.params.id);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    database.collection("expenses").deleteOne({ "_id": new ObjectId(`${req.params.id}`) }); //*** 01/01 + #7


});

app.get('/api/balance/sum', check, async (req, res) => { //da cancellare
    console.log(`/api/balance/sum`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    const result = await database.collection("expenses").aggregate([ //si può semplificare?
        {
            '$match': {
                'user': req.session.username
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

app.get('/api/balance', check, async (req, res) => { //visualizzazione riassunto dare/avere utente loggato
    console.log(`/api/balance`);
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    const result = await database.collection("expenses").aggregate([ //quanto tutti gli altri utenti devono all'utente loggato
        {
            $unwind: "$otherUsers"
        },
        {
            '$match': {
                'user': req.session.username
            }
        },
        {
            $group: {
                _id: "$otherUsers.user",
                totalQuote: { $sum: "$otherUsers.quote" }
            }
        }
    ]).toArray();

    const result2 = await database.collection("expenses").aggregate([ //quanto id loggato deve a tutti gli altri
        {
            $unwind: "$otherUsers"
        },
        {
            '$match': {
                'otherUsers.user': req.session.username
            }
        },
        {
            $group: {
                _id: "$user",
                totalQuote: { $sum: "$otherUsers.quote" }
            }
        }
    ]).toArray();

    const output = [{
        "have": result,
        "give": result2
    }
    ]

    res.json(output); //rivedere formato di esportazione

});

app.get('/api/balance/:id', check, async (req, res) => { //bilancio tra utente loggato e utente con id id.
    console.log(`/api/balance/:id`);

    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    const result = await database.collection("expenses").aggregate([ //quanto id deve all'utente loggato
        {
            '$unwind': '$otherUsers'
        },
        {
            '$match': {
                'user': req.session.username,
                'otherUsers.user': req.params.id
            }
        },
        {
            '$group': {
                '_id': null,
                'totalQuote': {
                    '$sum': '$otherUsers.quote'
                }
            }
        }
    ]).toArray();


    const result2 = await database.collection("expenses").aggregate([ //quanto utente loggato deve a id
        {
            '$unwind': '$otherUsers'
        }, {
            '$match': {
                'user': req.params.id,
                'otherUsers.user': req.session.username
            }
        }, {
            '$group': {
                '_id': null,
                'totalQuote': {
                    '$sum': '$otherUsers.quote'
                }
            }
        }
    ]).toArray();

    //console.log(result[0].totalQuote);
    //console.log(result2[0].totalQuote);

    const output = {
        "have": result[0].totalQuote,
        "give": result2[0].totalQuote
    }

    res.json(output); //ok, ma rivedere formato json


});

app.get('/api/budget/whoami', check, (req, res) => {
    res.json(req.session.username);

});

app.get('/api/users/search/:query', check, async (req, res) => { //eliminare password dai risultati
    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");
    console.log(`/api/users/search/:query`);
    console.log(req.params.query);
    const results = await database.collection("users").find({ "username": { "$regex": req.params.query, "$options": "i" } }).toArray();
    res.json(results);

});