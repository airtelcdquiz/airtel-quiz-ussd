
const axios_instance = require("axios").create({ 
    timeout: 5000,
    headers: { "Content-Type": "application/json" }
});


module.exports = {
    api : axios_instance
}