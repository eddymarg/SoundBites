const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const spotifyRoutes = require("./routes/spotifyRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const locationRoutes = require("./routes/locationRoutes")
const errorRoutes = require("./routes/errorRoutes")

dotenv.config()
connectDB()

const app = express()

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.startsWith("http://localhost") || origin === process.env.FRONTEND_URL) {
            return callback(null, true)
        }
        callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/", spotifyRoutes)
app.use("/api", restaurantRoutes)
app.use('/api', locationRoutes)
app.use('/api', errorRoutes)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))