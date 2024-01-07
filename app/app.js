const express = require("express");
const session = require('express-session');

const app = express();
const port = 3000;

const { MongoClient, ObjectId } = require("mongodb");
//const uri = "mongodb://127.0.0.1:27017";
const uri = "mongodb://mongohost";

const client = new MongoClient(uri);

app.use(express.json());
app.use(express.urlencoded());
app.use(session({ secret: 'xx', resave: false }));

app.listen(port, () => {
    console.log(`App in funzione sulla porta ${port}`);
});

app.get("/", (req, res) => {
    res.redirect('/signin.html');
});

app.get("/demo", async (req, res) => {
    await client.connect();

    const database = client.db("familybudget");

    const userDocument = {
        "username": "marco",
        "name": "Marco",
        "surname": "Lo Giudice",
        "password": "1234"
    };

    let count = await database.collection('users').countDocuments(userDocument);

    if (count == 0) {
        database.collection('users').insertOne(userDocument);
    }

    const userDocument2 = {
        "username": "pier",
        "name": "Pierpaolo",
        "surname": "Lo Giudice",
        "password": "1234"
    };

    count = await database.collection('users').countDocuments(userDocument2);

 

    if (count == 0) {
        database.collection('users').insertOne(userDocument2);
    }

    const demo = {
        user: "marco",
        category: "Cibo",
        date: new Date(),
        description: "Pizza",
        price: 10.25,
        otherUsers: [
            {
                user: "marco",
                quote: 6
            },
            {
                user: "pier",
                quote: 4.25
            }
        ]
    };

    count = await database.collection('expenses').countDocuments(demo);

    console.log(count); 

    if (count == 0) {
        database.collection('expenses').insertOne(demo);
    }

    const demo2 = {
        user: "pier",
        category: "Svago",
        date: new Date(),
        description: "Cinema",
        price: 20,
        otherUsers: [
            {
                user: "pier",
                quote: 10
            },
            {
                user: "marco",
                quote: 10
            }
        ]
    };

    count = await database.collection('expenses').countDocuments(demo2);

    if (count == 0) {
        database.collection('expenses').insertOne(demo2);
    }

    res.redirect('/signin.html?msg=2');
});

app.use(express.static(`${__dirname}/pages`));

app.post("/api/auth/signin", async (req, res) => {

    await client.connect();
    const database = client.db("familybudget");

    const user = await database.collection("users").findOne({ username: req.body.username });

    if (user) {
        if (user.password === req.body.password) {
            req.session.user = user;
            req.session.username = req.body.username;
            //res.send("ok");
            res.redirect('/home.html');
        } else {
            res.redirect('/signin.html?msg=1');
        }
    }
    else {
        res.redirect('/signin.html?msg=1');
    }
});

app.post("/api/auth/signup", async (req, res) => {

    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db("familybudget");

    let user = {
        username: req.body.username,
        name: req.body.name,
        surname: req.body.surname,
        password: req.body.password
    };
    await database.collection("users").insertOne(user);

    res.redirect('/signin.html?msg=4');

});

function check(req, res, next) {

    if (req.session.user) {
        next();
    } else {
        res.status(403).send("utente non autenticato");
    }
}

app.get('/api/auth/logout', check, async (req, res) => {

    delete req.session.user;
    res.redirect('/signin.html?msg=3');

});

app.get('/api/users/', check, async (req, res) => {

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

app.get('/api/budget/', check, async (req, res) => {

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

app.get('/api/budget/whoami', check, async (req, res) => {

    const database = client.db("familybudget");

    const filter = {
        'username': req.session.username
    };
    const projection = {
        'password': 0
    };

    const results = await database.collection("users").find(filter, { projection }).toArray();
    res.json(results);

});

app.get('/api/budget/search/', check, async (req, res) => {

    const database = client.db("familybudget");

    const results = await database.collection("expenses").find({ "description": { "$regex": req.query.q, "$options": "i" } }).toArray();
    res.json(results);

});

app.get('/api/budget/:year', check, async (req, res) => {

    const database = client.db("familybudget");

    const year = req.params.year;

    const filter = {
        'user': req.session.username,
        "date": { "$gte": new Date(`${year}-01-01`), "$lte": new Date(`${year}-12-31`) }
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

app.get('/api/budget/:year/:month', check, async (req, res) => {

    const database = client.db("familybudget");

    const year = req.params.year;
    const month = req.params.month;

    const filter = {
        'user': req.session.username,
        "date": { "$gte": new Date(`${year}-${month}-01`), "$lte": new Date(`${year}-${month}-31`) }
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

app.get('/api/budget_in/', check, async (req, res) => {

    const database = client.db("familybudget");

    const filter = {
        'user': {
            '$ne': req.session.username
        },
        'otherUsers.user': req.session.username
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

app.get('/api/budget/:year/:month/:id', check, async (req, res) => {

    const database = client.db("familybudget");

    const filter = {
        '_id': new ObjectId(`${req.params.id}`)
    };

    console.log(req.params.id);
    const results = await database.collection("expenses").find(filter).toArray();
    res.json(results);
    console.log(res.statusCode);

});

app.post('/api/budget/:year/:month/', check, async (req, res) => {

    const database = client.db("familybudget");

    const output = {
        user: req.session.username,
        category: req.body.category,
        description: req.body.description,
        date: new Date(`${req.body.date}`),
        price: parseFloat(req.body.price),
        otherUsers: Object.entries(req.body.otherUsers).map(([user, quote]) => ({
            user: user,
            quote: quote
        }))
    };

    console.log(output);

    const result = await database.collection("expenses").insertOne(output);
    console.log(result);
    res.json(result);

});

app.put('/api/budget/:year/:month/:id', check, async (req, res) => {

    const database = client.db("familybudget");

    const filter = {
        '_id': new ObjectId(`${req.params.id}`)
    };

    const result = await database.collection("expenses").updateOne(filter, {
        '$set': {
            'user': req.session.username,
            'category': req.body.category,
            'description': req.body.description,
            'date': new Date(`${req.body.date}`),
            'price': parseFloat(req.body.price),
            'otherUsers': Object.entries(req.body.otherUsers).map(([user, quote]) => ({
                user: user,
                quote: quote
            }))
        }
    });

    res.json(result);

});

app.delete('/api/budget/:year/:month/:id', check, async (req, res) => {

    const database = client.db("familybudget");

    const result = database.collection("expenses").deleteOne({ "_id": new ObjectId(`${req.params.id}`) });
    const deleted = (await result).deletedCount;

    if (deleted === 1) {
        res.sendStatus(200);
    }
    else {
        res.sendStatus(500);
    }

});

app.get('/api/balance', check, async (req, res) => { //visualizzazione riassunto dare/avere utente loggato

    const database = client.db("familybudget");

    const crediti = await database.collection("expenses").aggregate([ //quanto tutti gli altri utenti devono all'utente loggato
        {
            $unwind: "$otherUsers"
        },
        {
            '$match': {
                'user': req.session.username,
                'otherUsers.quote': {
                    '$gt': 0
                }
            }
        },
        {
            $group: {
                _id: null,
                totalQuote: { $sum: "$otherUsers.quote" }
            }
        }
    ]).toArray();

    const debiti = await database.collection("expenses").aggregate([ //quanto id loggato deve a tutti gli altri
        {
            $unwind: "$otherUsers"
        },
        {
            '$match': {
                'otherUsers.user': req.session.username,
                'otherUsers.quote': {
                    '$gt': 0
                }
            }
        },
        {
            $group: {
                _id: null,
                totalQuote: { $sum: "$otherUsers.quote" }
            }
        }
    ]).toArray();

    const rimborsiIN = await database.collection("expenses").aggregate([ //quanto sono stato rimborsato
        {
            $unwind: "$otherUsers"
        },
        {
            '$match': {
                'otherUsers.user': req.session.username,
                'otherUsers.quote': {
                    '$lt': 0
                }
            }
        },
        {
            $group: {
                _id: null,
                totalQuote: { $sum: "$otherUsers.quote" }
            }
        }
    ]).toArray();


    const rimborsiOUT = await database.collection("expenses").aggregate([ //quanto ho rimborsato
        {
            $unwind: "$otherUsers"
        },
        {
            '$match': {
                'user': req.session.username,
                'otherUsers.quote': {
                    '$lt': 0
                }
            }
        },
        {
            $group: {
                _id: null,
                totalQuote: { $sum: "$otherUsers.quote" }
            }
        }
    ]).toArray();

    if (crediti[0]?.totalQuote);
    else {
        crediti[0] = [];
        crediti[0].totalQuote = 0;
    }

    if (debiti[0]?.totalQuote);
    else {
        debiti[0] = [];
        debiti[0].totalQuote = 0;
    }

    if (rimborsiIN[0]?.totalQuote);
    else {
        rimborsiIN[0] = [];
        rimborsiIN[0].totalQuote = 0;
    }

    if (rimborsiOUT[0]?.totalQuote);
    else {
        rimborsiOUT[0] = [];
        rimborsiOUT[0].totalQuote = 0;
    }

    const output = [{
        "have": crediti,
        "give": debiti,
        "refundIn": rimborsiIN,
        "refundOut": rimborsiOUT,
        "diff": {
            _id: null,
            totalQuote: parseFloat(debiti[0].totalQuote) + parseFloat(-crediti[0].totalQuote) + parseFloat(-rimborsiIN[0].totalQuote) + parseFloat(rimborsiOUT[0].totalQuote)
        }
    }]

    res.json(output);

});

app.get('/api/balance/:id', check, async (req, res) => { //bilancio tra utente loggato e utente con id id.

    const database = client.db("familybudget");

    const credito = await database.collection("expenses").aggregate([ //quanto id deve all'utente loggato
        {
            '$unwind': '$otherUsers'
        },
        {
            '$match': {
                'user': req.session.username,
                'otherUsers.user': req.params.id,
                'otherUsers.quote': {
                    '$gt': 0
                }
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

    const debito = await database.collection("expenses").aggregate([ //quanto utente loggato deve a id
        {
            '$unwind': '$otherUsers'
        }, {
            '$match': {
                'user': req.params.id,
                'otherUsers.user': req.session.username,
                'otherUsers.quote': {
                    '$gt': 0
                }
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

    const rimborsiOUT = await database.collection("expenses").aggregate([ //quanto utente loggato ha rimborsato id
        {
            '$unwind': '$otherUsers'
        },
        {
            '$match': {
                'user': req.session.username,
                'otherUsers.user': req.params.id,
                'otherUsers.quote': {
                    '$lt': 0
                }
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

    const rimborsiIN = await database.collection("expenses").aggregate([ //
        {
            '$unwind': '$otherUsers'
        }, {
            '$match': {
                'user': req.params.id,
                'otherUsers.user': req.session.username,
                'otherUsers.quote': {
                    '$lt': 0
                }
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

    if (credito[0]?.totalQuote);
    else {
        credito[0] = [];
        credito[0].totalQuote = 0;
    }

    if (debito[0]?.totalQuote);
    else {
        debito[0] = [];
        debito[0].totalQuote = 0;
    }

    if (rimborsiOUT[0]?.totalQuote);
    else {
        rimborsiOUT[0] = [];
        rimborsiOUT[0].totalQuote = 0;
    }

    if (rimborsiIN[0]?.totalQuote);
    else {
        rimborsiIN[0] = [];
        rimborsiIN[0].totalQuote = 0;
    }


    const output = {
        "toHave": parseFloat(-credito[0].totalQuote),
        "toGive": parseFloat(debito[0].totalQuote),
        "refundIN": parseFloat(rimborsiIN[0].totalQuote),
        "refundOUT": parseFloat(rimborsiOUT[0].totalQuote),
        "balance": parseFloat(debito[0].totalQuote) + parseFloat(-credito[0].totalQuote) + parseFloat(-rimborsiIN[0].totalQuote) + parseFloat(rimborsiOUT[0].totalQuote)
    }

    res.json(output);

});

app.get('/api/users/search/', check, async (req, res) => {

    const database = client.db("familybudget");

    const filter = {
        'username': { "$regex": req.query.q, "$options": "i" }
    };
    const projection = {
        'password': 0
    };

    const results = await database.collection("users").find(filter, { projection }).toArray();
    res.json(results);

});