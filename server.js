const express = require("express")
const dotenv = require("dotenv").config() // import statement for .env file
const { errorHandler } = require("./middleware/errorHandler")

const PORT = process.env.PORT || 8000

const app = express()

app.use("/api/", require("./routes/routes"))
app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}.`))
