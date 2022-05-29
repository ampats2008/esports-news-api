const express = require("express")
const dotenv = require("dotenv").config() // import statement for .env file

const PORT = process.env.PORT || 8000

const app = express()

app.use("/api/", require("./routes/routes"))

app.listen(PORT, () => console.log(`Server running on port ${PORT}.`))
