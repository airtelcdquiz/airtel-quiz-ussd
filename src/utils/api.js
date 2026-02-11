
const axios_instance = require("axios").create({
    baseURL: "http://quiz-user-service:3000/api",
    timeout: 5000,
    headers: { "Content-Type": "application/json" }
});


module.exports = {
    api : axios_instance
}