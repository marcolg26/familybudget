const { createApp } = Vue;
const app5 = createApp({
    data() {
        return {
            transactions: [],
            users: [],
            balance: [],
            form: {
                date: new Date(),
                category: 'Rimborso',
                description: 'Quota',
                price: 0,
                otherUsers: {
                }

            },
            user: '',
            price: '',
        };
    },
    methods: {
        getTransactionsIN: async function () {
            const response = await fetch("api/budget_in");
            if (response.status === 403) {
                console.log("403 non autorizzato");
                location.assign('signin.html?msg=err');
            }
            this.transactions = await response.json();
        },
        getUsers: async function () {
            const response = await fetch("/api/users");
            this.users = await response.json();

            this.users.forEach(async user => {

                const response = await fetch("/api/balance/" + user.username);
                utente = await response.json();

                this.balance[user.username] = utente.balance;
            });

            console.log(this.balance);

        },
        apriRimborso(user, price) {

            console.log(user);
            console.log(price);

            this.user = user;
            this.price = price;

            this.form.price = 0;
            this.form.otherUsers[user] = price;

        },
        post: async function () {

            console.log(this.form);
            
            url = "/api/budget/"
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.form)
            };
            const response = fetch(url, requestOptions).then(this.getTransactionsIN()).then(this.getUsers());
            console.log((await response).json());
        },
    },
    mounted() {
        this.getTransactionsIN();
        this.getUsers();
    },
}).mount("#app5");