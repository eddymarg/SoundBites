const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const spotifyRoutes = require("./routes/spotifyRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/", spotifyRoutes)
app.use("/api", restaurantRoutes)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))