import React, { useState, useEffect } from "react"
import axios from "axios"
import { Typography, Stack, Button, Box, InputAdornment, IconButton, CircularProgress } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { useNavigate, useParams } from "react-router-dom"
import { Logo } from "../assets/Logo"
import { NoteLogo } from "../assets/noteLogo"
import CustomTextField from "../components/customTextField"

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [confirmStatus, setConfirmStatus] = useState("") // "" | "match" | "mismatch"
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(3)

    useEffect(() => {
        if (!successMsg) return
        const interval = setInterval(() => {
            setCountdown(c => c - 1)
        }, 1000)
        const timeout = setTimeout(() => {
            navigate("/signin", { state: { passwordReset: true } })
        }, 3000)
        return () => { clearInterval(interval); clearTimeout(timeout) }
    }, [successMsg])

    const validatePassword = (pw) => {
        if (pw.length < 8) return "Password must be at least 8 characters long."
        if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter."
        if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter."
        if (!/[!@#$%&*,.?:]/.test(pw)) return "Password must include a special character (!@#$%&*,.?:)."
        return ""
    }

    const handlePasswordChange = (val) => {
        setPassword(val)
        if (passwordTouched) setPasswordError(validatePassword(val))
        if (confirmPassword) setConfirmStatus(confirmPassword === val ? "match" : "mismatch")
    }

    const handlePasswordBlur = () => {
        setPasswordTouched(true)
        setPasswordError(validatePassword(password))
    }

    const handleConfirmChange = (val) => {
        setConfirmPassword(val)
        if (!val) { setConfirmStatus(""); return }
        setConfirmStatus(val === password ? "match" : "mismatch")
    }

    const handleReset = async () => {
        setPasswordError("")
        setConfirmStatus("")

        const pwErr = validatePassword(password)
        if (pwErr) { setPasswordError(pwErr); setPasswordTouched(true); return }
        if (password !== confirmPassword) { setConfirmStatus("mismatch"); return }

        setLoading(true)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password })
            setSuccessMsg(res.data.msg)
        } catch (err) {
            setPasswordError(err.response?.data?.msg || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box sx={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 4 } }}>
            <Box
                onClick={() => navigate("/")}
                sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 10,
                    cursor: "pointer",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "scale(1.1)" }
                }}
            >
                <Logo />
            </Box>

            <Stack spacing={2} sx={{ width: "100%", maxWidth: "480px" }}>
                <Typography
                    fontSize={{ xs: '36px', sm: '44px', md: '52px' }}
                    sx={{ fontFamily: "'Tinos', serif", fontWeight: 700, color: '#EF233C' }}
                >
                    Set a new password
                </Typography>
                <NoteLogo />
                <Typography fontSize={{ xs: '26px', sm: '32px', md: '36px' }} fontWeight={700}>New Password</Typography>

                {successMsg ? (
                    <Stack spacing={2}>
                        <Typography sx={{ color: 'green' }}>{successMsg}</Typography>
                        <Typography sx={{ color: '#888', fontSize: '14px' }}>
                            Redirecting to sign in in {countdown}…
                        </Typography>
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <CustomTextField
                            label="New password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            onBlur={handlePasswordBlur}
                            error={!!passwordError}
                            helperText={passwordError}
                            sx={{ width: '100%' }}
                            type={showPassword ? "text" : "password"}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(s => !s)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <CustomTextField
                            label="Confirm new password"
                            variant="outlined"
                            value={confirmPassword}
                            onChange={(e) => handleConfirmChange(e.target.value)}
                            error={confirmStatus === "mismatch"}
                            helperText={
                                confirmStatus === "match" ? "✓ Passwords match" :
                                confirmStatus === "mismatch" ? "Passwords do not match" : ""
                            }
                            FormHelperTextProps={{
                                sx: { color: confirmStatus === "match" ? "green" : undefined }
                            }}
                            sx={{ width: '100%' }}
                            type={showConfirm ? "text" : "password"}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirm(s => !s)} edge="end">
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            variant="contained"
                            color="basic"
                            onClick={handleReset}
                            disabled={loading}
                            sx={{
                                width: '100%',
                                height: { xs: '48px', md: '56px' },
                                color: '#0D1B2A',
                                fontSize: { xs: '18px', md: '22px' },
                                borderRadius: '36px',
                                boxShadow: '-8px 8px 0 #EF233C',
                                textTransform: 'none',
                                '&:hover': { boxShadow: 'none' }
                            }}
                        >
                            {loading ? <CircularProgress size={22} /> : 'Reset password'}
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Box>
    )
}

export default ResetPassword
