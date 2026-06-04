const spotifyUser = require("../models/SpotifyUser")
const { refreshAccessToken } = require("./spotifyController")
const Save = require("../models/Save")
const List = require("../models/List")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

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

        let spotifyAccessToken = null
        if (user.spotifyRefreshToken) {
            try {
                spotifyAccessToken = await refreshAccessToken(user.spotifyRefreshToken)
            } catch (err) {
                console.error("Failed to refresh Spotify token on login:", err.message)
            }
        }

        res.json({
            user: { id: user._id, email: user.email },
            ...(spotifyAccessToken && {
                spotifyAccessToken,
                spotifyRefreshToken: user.spotifyRefreshToken,
            })
        })
    } catch(err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body
    if (!email) return res.status(400).json({ msg: "Email is required." })

    try {
        const user = await spotifyUser.findOne({ email })
        if (!user) return res.status(400).json({ msg: "No account with that email was found." })

        const token = crypto.randomBytes(32).toString("hex")
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hour
        await user.save()

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: Number(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })

        await transporter.sendMail({
            from: `"SoundBites" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Reset your SoundBites password",
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #EF233C;">Password Reset</h2>
                    <p>Hi ${user.display_name || "there"},</p>
                    <p>We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
                    <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#EF233C;color:#fff;border-radius:36px;text-decoration:none;font-size:16px;">Reset Password</a>
                    <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        })

        res.json({ msg: "Password reset email sent. Check your inbox." })
    } catch (err) {
        console.error("Forgot password error:", err)
        res.status(500).json({ msg: "Failed to send reset email. Please try again." })
    }
}

exports.resetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    if (!password) return res.status(400).json({ msg: "New password is required." })

    try {
        const user = await spotifyUser.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })

        if (!user) return res.status(400).json({ msg: "Reset link is invalid or has expired." })

        if (user.password) {
            const isSame = await bcrypt.compare(password, user.password)
            if (isSame) return res.status(400).json({ msg: "New password must be different from your current password." })
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.json({ msg: "Password updated successfully. You can now sign in." })
    } catch (err) {
        console.error("Reset password error:", err)
        res.status(500).json({ msg: "Internal server error." })
    }
}

exports.signup = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ msg: "All fields are required." })
    }

    try {
        const existing = await spotifyUser.findOne({ email })
        if (existing) return res.status(400).json({ msg: "An account with that email already exists." })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new spotifyUser({
            display_name: name,
            email,
            password: hashedPassword,
        })

        await newUser.save()

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        res.status(201).json({ user: { id: newUser._id, email: newUser.email }, token })
    } catch (err) {
        console.error("Signup error:", err)
        res.status(500).json({ msg: "Internal server error." })
    }
}

exports.checkExistingUser = async (req, res) => {
    const { email } = req.body

    if(!email ) {
        return res.status(400).json({ message: "Email required"})
    }

    try {
        const findUser = await spotifyUser.findOne({ email })
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

exports.getProfile = async (req, res) => {
    try {
        const user = await spotifyUser.findById(req.user.id).select("display_name email avatar explicitContentFilter spotifyId")
        if (!user) return res.status(404).json({ msg: "User not found" })
        res.json({
            display_name: user.display_name,
            email: user.email,
            avatar: user.avatar,
            explicitContentFilter: user.explicitContentFilter ?? false,
            hasSpotify: !!user.spotifyId,
        })
    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { display_name } = req.body
        const update = {}
        if (display_name !== undefined) update.display_name = display_name
        if (req.file) {
            update.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
        }
        const user = await spotifyUser.findByIdAndUpdate(req.user.id, update, { new: true })
        if (!user) return res.status(404).json({ msg: "User not found" })
        res.json({ msg: "Profile updated", display_name: user.display_name, avatar: user.avatar })
    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

exports.requestPasswordChange = async (req, res) => {
    try {
        const user = await spotifyUser.findById(req.user.id)
        if (!user) return res.status(404).json({ msg: "User not found" })
        if (!user.email) return res.status(400).json({ msg: "No email associated with this account." })

        const token = crypto.randomBytes(32).toString("hex")
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
        await user.save()

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: Number(process.env.EMAIL_PORT) === 465,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        })

        await transporter.sendMail({
            from: `"SoundBites" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Change your SoundBites password",
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #EF233C;">Change Password</h2>
                    <p>Hi ${user.display_name || "there"},</p>
                    <p>We received a request to change your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
                    <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#EF233C;color:#fff;border-radius:36px;text-decoration:none;font-size:16px;">Change Password</a>
                    <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        })

        res.json({ msg: `Password change email sent to ${user.email}. Check your inbox.` })
    } catch (err) {
        console.error("Request password change error:", err)
        res.status(500).json({ msg: "Failed to send email. Please try again." })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id
        await Save.deleteMany({ userId })
        await List.deleteMany({ userId })
        await spotifyUser.findByIdAndDelete(userId)
        res.clearCookie("token")
        res.json({ msg: "Account deleted successfully." })
    } catch (err) {
        console.error("Delete account error:", err)
        res.status(500).json({ msg: "Failed to delete account. Please try again." })
    }
}