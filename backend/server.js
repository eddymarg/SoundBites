const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const spotifyRoutes = require("./routes/spotifyRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const locationRoutes = require("./routes/locationRoutes")

dotenv.config()
connectDB()

const app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://soundbites-omega.vercel.app/"
    ],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/", spotifyRoutes)
app.use("/api", restaurantRoutes)
app.use('/api', locationRoutes)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))