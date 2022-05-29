// routes -- define the endpoints for the API

const express = require("express")
const router = express.Router()

// import controller functions:
const { getArticles } = require("../controllers/controllers")

// *: DEFINE ENDPOINTS FOR API HERE:
router.route("/").get(getArticles)
router.route("/:source").get(getArticles)

module.exports = router
