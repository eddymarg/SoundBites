const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // field validation
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields are required"})
        }

        // email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^s\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: "Invalid email format" })
        }

        if (password.length < 8) {
            return res.status(400).json({ msg: "Password must be at least 8 characters long" })
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ msg: "Password must contain at least one uppercase letter" })
        }
        if (!/[!@#$%&*,.?:]/.test(password)) {
            return res.status(400).json({ msg: "Password must include at least one special character (!, @, #, $, %, &, *, ., ?, :"})
        }

        // check for existing user
        let user = await User.findOne({ email })
        if (user) return res.status(400).json({ msg: "User already exists" })

        // password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // create new user
        user = new User({
            name,
            email,
            password: hashedPassword,
        })

        await user.save()
        res.status(201).json({ msg: "User registered successfully" })
    } catch (err) {
        res.status(500).json({ msg: err.message || "Internal Server Error" })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // find user by email
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ msg: "Invalid credentials" })

        // compare password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({ msg: "Invalid credentials" })

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

        res.json({ user: { id: user._id, email: user.email }})
    } catch(err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}