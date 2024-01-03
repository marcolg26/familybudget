const { createApp } = Vue;
const app = createApp({
    data() {
        return {
            transactions: [],
            users: [],
        };
    },
    methods: {
        getTransactions: async function () {
            const response = await fetch("/api/budget2");
            this.transactions = await response.json();
            console.log(typeof this.transactions);
            console.log(this.transactions);
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
            const response = await fetch("/api/balance2");
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
            situation:[],
            balance: 0,
        };
    },
    methods: {
        getBalance: async function () {
            const response = await fetch("/api/balance");
            this.situation = await response.json();
            this.balance=this.situation[0].diff.totalQuote;
            console.log(this.balance)
        }
    },
    mounted() {
        this.getBalance();
    },
}).mount("#app4");