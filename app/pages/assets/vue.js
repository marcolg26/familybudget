const { createApp } = Vue;
const app = createApp({
    data() {
        return {
            transactions: [],
            users: [],
            select: 1,
            year: 0,
            month: 0,
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
        del: async function (id) {
            url = "/api/budget/" + id;
            const response = fetch(url, { method: 'DELETE' });
            console.log((await response).json());

        },
        modify: async function (id) {
            url = "/api/budget/" + id;
            alert(url);
            const response = fetch(url, { method: 'PUT' });
            console.log((await response).json());
        },
        datefilter() {
            this.getTransactions();
        }
    },
    mounted() {
        this.getTransactions();
        this.getUsers();
    },
}).mount("#app");

const app2 = createApp({
    data() {
        return {
            users: [],
            form: {
                category: '',
                description: '',
                price: '',
                otherUsers: {}
            }
        };
    },
    methods: {
        getUsers: async function () {
            const response = await fetch("/api/users");
            this.users = await response.json();
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
            const response = fetch(url, requestOptions);
            console.log((await response).json());
        }
    },
    mounted() {
        this.getUsers();
    },
}).mount("#app2");

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