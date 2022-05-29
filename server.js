const express = require("express")
const dotenv = require("dotenv").config() // import statement for .env file

const PORT = process.env.PORT // || 8000

const app = express()

app.listen(PORT, () => console.log(`Server running on port ${PORT}.`))
