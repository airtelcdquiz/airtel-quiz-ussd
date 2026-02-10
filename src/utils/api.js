
const axios_instance = require("axios").create({
    baseURL: "https://quiz-user-service.airtelquiz.com/api",
    timeout: 5000,
    headers: { "Content-Type": "application/json" }
});


module.exports = {
    api : axios_instance
}