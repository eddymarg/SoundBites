import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, IconButton, Stack, Typography } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import React, { useState } from "react"
import CustomTextField from "./customTextField"

const validatePassword = (pw) => {
    if (pw.length < 8) return "Must be at least 8 characters."
    if (!/[A-Z]/.test(pw)) return "Must contain at least one uppercase letter."
    if (!/[a-z]/.test(pw)) return "Must contain at least one lowercase letter."
    if (!/[!@#$%&*,.?:]/.test(pw)) return "Must include a special character (!@#$%&*,.?:)."
    return ""
}

const AddPassword = ({ open, onClose, spotifyId }) => {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [confirmStatus, setConfirmStatus] = useState("") // "" | "match" | "mismatch"
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

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

    const handleSubmit = async () => {
        setError("")
        const pwErr = validatePassword(password)
        if (pwErr) { setPasswordError(pwErr); setPasswordTouched(true); return }
        if (password !== confirmPassword) { setConfirmStatus("mismatch"); return }

        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/set-spotify-user-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('spotify_access_token')}`
                },
                body: JSON.stringify({ password })
            })
            const data = await res.json()
            if (res.ok) {
                setSuccess(true)
                setTimeout(() => onClose(), 1500)
            } else {
                setError(data.error || "Something went wrong")
            }
        } catch (err) {
            console.error("Password set error:", err)
            setError("Network error.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { borderRadius: '24px', p: 1, width: { xs: '90vw', sm: '440px' } } }}
        >
            <DialogTitle sx={{
                fontFamily: "'Tinos', serif",
                fontWeight: 700,
                color: '#EF233C',
                fontSize: { xs: '20px', sm: '24px' },
                textAlign: 'center',
                pb: 0,
            }}>
                Your table's almost ready! 🍽️
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ textAlign: 'center', mb: 2, fontSize: '14px', color: '#555' }}>
                    Just add a password to complete the dish. That way, you can come back for seconds without going through the whole 'new guest' process.
                </DialogContentText>
                <Stack spacing={2}>
                    <CustomTextField
                        label="Password"
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
                        label="Confirm Password"
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
                    {error && <Typography color="error" sx={{ fontSize: '14px' }}>{error}</Typography>}
                    {success && <Typography sx={{ color: 'green', fontSize: '14px' }}>Password saved!</Typography>}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        color: '#0D1B2A',
                        border: '2px solid #EF233C',
                        borderRadius: '36px',
                        textTransform: 'none',
                        px: 3,
                        '&:hover': { backgroundColor: '#EF233C20' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        color: 'white',
                        backgroundColor: '#EF233C',
                        border: '2px solid #EF233C',
                        borderRadius: '36px',
                        textTransform: 'none',
                        px: 3,
                        '&:hover': { backgroundColor: '#c81a31' }
                    }}
                >
                    {loading ? "Saving..." : "Save Password"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddPassword
