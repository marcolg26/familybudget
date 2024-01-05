const { createApp } = Vue;
const app = createApp({
    data() {
        return {
            transactions: [],
            users: [],
            user: [],
            form: {
                id: '',
                category: '',
                description: '',
                price: '',
                otherUsers: {},
                otherUsersCheck: {}
            },
            select: 1,
            year: 0,
            month: 0,
            nuovo: 1,
            situation: [],
            balance: 0,
        };
    },
    methods: {
        getTransactions: async function () {
            let url = "/api/budget";
            if (this.year == 0) url = "/api/budget";
            else if (this.year > 0) {
                if (this.month == 0)
                    url = "/api/budget/" + this.year;
                else url = "/api/budget/" + this.year + "/" + this.month;
            }

            console.log(url);
            const response = await fetch(url);
            this.transactions = await response.json();
        },
        getUsers: async function () {
            const response = await fetch("/api/users");
            this.users = await response.json();
        },
        getUser: async function () {
            const response = await fetch("/api/budget/whoami");
            record = await response.json();
            this.user = record[0];
        },
        getRecord: async function (id) {

            this.nuovo = 0;

            const response = await fetch("/api/budget/2024/12/" + id);
            record = await response.json();

            this.form.otherUsersCheck = {};
            this.form.otherUsers = {};

            this.form.id = record[0]._id;
            this.form.category = record[0].category;
            this.form.description = record[0].description;
            this.form.price = record[0].price;

            record[0].otherUsers.forEach(element => {
                this.form.otherUsers[element.user] = element.quote;
                this.form.otherUsersCheck[element.user] = 1;
            });

            console.log(this.form);
        },
        del: async function (id) {
            url = "/api/budget/" + id;
            const response = fetch(url, { method: 'DELETE' }).then(this.getTransactions());
            console.log((await response).json());

        },
        put: async function (id) {
            this.getRecord(id);
            url = "/api/budget/2024/12/" + id;
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.form)
            };
            const response = fetch(url, requestOptions).then(this.getTransactions());
            this.getTransactions(); //a quanto pare è necessario...
            console.log((await response).json());
        },
        datefilter() {
            this.getTransactions();
        },
        toggleUserInExpense(user) { //s
            if (this.form.otherUsers[user] !== undefined) {
                delete this.form.otherUsers[user];
            } else {
                this.form.otherUsers[user] = 0
            }
        },
        post: async function () {

            url = "/api/budget/"
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.form)
            };
            const response = fetch(url, requestOptions).then(this.getTransactions());
            console.log((await response).json());
        },
        clean() {

            this.nuovo = 1;

            delete this.form.id;

            this.form.category = "";
            this.form.description = "";
            this.form.price = "";

            this.form.otherUsers={};
            this.form.otherUsersCheck={};
        },
        getBalance: async function () {
            const response = await fetch("/api/balance");
            this.situation = await response.json();
            this.balance = this.situation[0].diff.totalQuote;
            console.log(this.balance)
        }
    },
    mounted() {
        this.getBalance();
        this.getTransactions();
        this.getUser();
        this.getUsers();
    },
}).mount("#app");

const app3 = createApp({
    data() {
        return {
            transactions: [],
        };
    },
    methods: {
        getTransactions: async function () {
            const response = await fetch("/api/balance_detail");
            this.transactions = await response.json();
            console.log(this.transactions)
        }
    },
    mounted() {
        this.getTransactions();
    },
}).mount("#app3");

const app4 = createApp({
    data() {
        return {
            situation: [],
            balance: 0,
        };
    },
    methods: {
        getBalance: async function () {
            const response = await fetch("/api/balance");
            this.situation = await response.json();
            this.balance = this.situation[0].diff.totalQuote;
            console.log(this.balance)
        }
    },
    mounted() {
        this.getBalance();
    },
}).mount("#app4");

const app5 = createApp({
    data() {
        return {
            transactions: [],
        };
    },
    methods: {
        getTransactions: async function () {
            const response = await fetch("api/budget_in");
            this.transactions = await response.json();
        }
    },
    mounted() {
        this.getTransactions();
    },
}).mount("#app5");