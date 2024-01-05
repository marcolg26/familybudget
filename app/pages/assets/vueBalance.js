const { createApp } = Vue;
const app5 = createApp({
    data() {
        return {
            transactions: [],
            users: [],
            balance: []
        };
    },
    methods: {
        getTransactionsIN: async function () {
            const response = await fetch("api/budget_in");
            this.transactions = await response.json();
        },
        getUsers: async function () {
            const response = await fetch("/api/users");
            this.users = await response.json();
            
            this.users.forEach(async user => {

                const response = await fetch("/api/balance/"+user.username);
                utente = await response.json();

                this.balance[user.username] = utente.balance;
            });

            console.log(this.balance);

        },
    },
    mounted() {
        this.getTransactionsIN();
        this.getUsers();
    },
}).mount("#app5");