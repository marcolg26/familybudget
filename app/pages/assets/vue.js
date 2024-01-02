const { createApp } = Vue;
const app = createApp({
    data() {
        return {
            transactions: [],
        };
    },
    methods: {
        getTransactions: async function () {
            const response = await fetch("/api/budget2");
            this.transactions = await response.json();
        },
        del: async function(id) {
            url="/api/budget/"+id;
            alert(url);
            console.log("x");
            const response = fetch(url, { method: 'DELETE' });
            console.log((await response).json());
          }
    },
    mounted() {
        this.getTransactions();
    },
}).mount("#app");