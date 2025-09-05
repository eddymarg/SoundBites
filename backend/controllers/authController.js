const spotifyUser = require("../models/SpotifyUser")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Assists w/ login by checking for user and password
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // find user by email
        const user = await spotifyUser.findOne({ email })
        if (!user) return res.status(400).json({ msg: "Invalid email or password" })

        // compare password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({ msg: "Invalid email or password" })

        // generate jwt token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        })

        // send token in HTTP-only cookie(more security)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict", 
        })

        console.log("Token cookie set")

        res.json({ user: { id: user._id, email: user.email }})
    } catch(err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

exports.checkExistingUser = async (req, res) => {
    const { email } = req.body
    
    if(!email ) {
        return res.status(400).json({ message: "Email required"})
    }

    try {
        const findUser = spotifyUser.findOne({ email })
        if(findUser) {
            return res.status(200).json({ exists: true })
        } else {
            return res.status(200).json({ exists: false })
        }
    } catch (error) {
        console.error("Error checking if Spotify user exists:", error)
        return res.status(500).json({ message: "Server error" })
    }
}