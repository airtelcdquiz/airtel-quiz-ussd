const { Pool } = require("pg");
const axios = require("axios");

const pool = new Pool({
  user: "ussd",
  host: "ussd-postgres",
  database: "ussd",
  password: "ussd",
  port: 5432
});

async function getMenu(menuId) {
  const res = await pool.query("SELECT * FROM ussd_menu WHERE id=$1", [menuId]);
  return res.rows[0];
}

async function getMenuText(menu, session, input) {
  if (menu.type === "dynamic" && menu.logic) {
    // exemple: appel API dynamique
    const url = menu.logic.replace("{{input}}", encodeURIComponent(input || ""));
    try {
      const response = await axios.get(url);
      return response.data.message || menu.text;
    } catch (err) {
      console.error("API call failed", err);
      return menu.text;
    }
  }
  return menu.text;
}


module.exports =  {
  getMenu,
  getMenuText
}