const res = require("express/lib/response")

// functions that define actions to take when someone hits an API endpoint
const getArticles = (req, res) => {
  res.status(200).json("Articles found.")
}

module.exports = {
  getArticles,
}
