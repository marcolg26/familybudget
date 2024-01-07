const { createApp } = Vue;
const app = createApp({
    data() {
        return {
            transactions: [],
            users: [],
            user: [],
            form: {
                id: '',
                date: '',
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
            debts: 0,
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

            const response = await fetch(url);
            this.transactions = await response.json();
        },
        getUsers: async function () {

            this.debts = 0;

            const response = await fetch("/api/users");
            this.users = await response.json();

            this.users.forEach(async user => {

                const response = await fetch("/api/balance/" + user.username);
                utente = await response.json();

                if (utente.balance > 0) this.debts++;
            });
        },
        getUser: async function () {
            const response = await fetch("/api/budget/whoami");
            record = await response.json();
            this.user = record[0];
        },
        getRecord: async function (id) {

            this.nuovo = 0;

            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            const response = await fetch("/api/budget/" + year + "/" + month + "/" + id);
            record = await response.json();

            this.form.otherUsersCheck = {};
            this.form.otherUsers = {};

            this.form.id = record[0]._id;

            this.form.date = new Date(record[0].date).toISOString().slice(0, 10);

            this.form.category = record[0].category;
            this.form.description = record[0].description;
            this.form.price = record[0].price;

            record[0].otherUsers.forEach(element => {
                this.form.otherUsers[element.user] = element.quote;
                this.form.otherUsersCheck[element.user] = 1;
            });

        },
        del: async function (id) {

            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            url = "/api/budget/" + year + "/" + month + "/" + id;

            fetch(url, { method: 'DELETE' }).then((response) => { console.log(response.status) }).then(this.getTransactions()).then(this.getBalance()).then(this.getUsers());

        },
        put: async function (id) {

            this.getRecord(id);

            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            url = "/api/budget/" + year + "/" + month + "/" + id;
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.form)
            };
            const response = fetch(url, requestOptions);
            console.log((await response).json());
            this.getTransactions(); //x
            this.getBalance();
            this.getUsers();
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
            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            console.log(month);

            url = "/api/budget/" + year + "/" + month + "/";

            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.form)
            };
            const response = fetch(url, requestOptions).then(this.getTransactions()).then(this.getBalance()).then(this.getUsers());
            console.log((await response).json());
        },
        clean() {

            this.nuovo = 1;

            delete this.form.id;

            this.form.category = "";
            this.form.description = "";
            this.form.price = "";

            this.form.otherUsers = {};
            this.form.otherUsersCheck = {};
        },
        getBalance: async function () {
            const response = await fetch("/api/balance");
            if (response.status === 403) {
                console.log("403 non autorizzato");
                location.assign('signin.html?msg=5');
            }
            this.situation = await response.json();
            this.balance = this.situation[0].diff.totalQuote;
        }
    },
    mounted() {
        this.getBalance();
        this.getTransactions();
        this.getUser();
        this.getUsers();
    },
}).mount("#app");