const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body

        // check for existing user
        let user = await User.findOne({ email })
        if (user) return res.status(400).json({ msg: "User already exists" })

        // password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // create new user
        user = new User({
            email,
            password: hashedPassword,
        })

        await user.save()
        res.status(201).json({ msg: "User registered successfully" })
    } catch (err) {
        res.status(500).json({ msg: "Server error" })
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

        res.json({ token, user: { id: user._id, email: user.email }})
    } catch(err) {
        res.status(500).json({ msg: "Server error" })
    }
}