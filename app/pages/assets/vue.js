const { createApp } = Vue;
const app = createApp({
    data() {
        return {
            transactions: [],
        };
    },
    methods: {
        getTransactions: async function () {
            const response = await fetch("/api/budget");
            this.transactions = await response.json();
        },
    },
    mounted() {
        this.getTransactions();
    },
}).mount("#app");