import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
    Box, Stack, Avatar, Typography, TextField, Button, ButtonBase,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Snackbar, Alert, IconButton, Tooltip, InputAdornment, Chip,
    Accordion, AccordionSummary, AccordionDetails, Divider
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import CheckIcon from "@mui/icons-material/Check"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import LogoutIcon from "@mui/icons-material/Logout"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import MusicNoteIcon from "@mui/icons-material/MusicNote"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import LocationOffIcon from "@mui/icons-material/LocationOff"
import MyLocationIcon from "@mui/icons-material/MyLocation"
import { useNavigate } from "react-router-dom"
import { LogoWNote } from "../assets/logoWNote"
import LogoutScreen from "../components/LogoutScreen"

const getAuthToken = () => localStorage.getItem("app_token") || localStorage.getItem("spotify_access_token")

const FAQ = [
    {
        q: "How do recommendations work?",
        a: "We look at your top Spotify artists and genres, then map those vibes to restaurants near you. The more you listen, the better the match."
    },
    {
        q: "Why do I need Spotify?",
        a: "SoundBites builds recommendations from your real listening history. Without Spotify data we can't personalise results to your taste."
    },
    {
        q: "Why isn't my location right?",
        a: "Your location is detected automatically. You can refresh it anytime from the Location card in Profile Settings — this updates what restaurants we show you."
    },
    {
        q: "My browser blocked location — what do I do?",
        a: "Click the lock icon in your browser's address bar, find the Location permission, set it to 'Allow', then refresh the page and try again from Profile Settings."
    },
    {
        q: "How do I save a restaurant?",
        a: "Tap the bookmark icon on any restaurant card. View saved spots in the Saved Restaurants page."
    },
    {
        q: "How do I report a problem?",
        a: "Open an issue on our GitHub page or use the feedback option in the app."
    },
]

const card = {
    bgcolor: "white",
    borderRadius: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    p: { xs: 2.5, sm: 3 },
    overflow: "hidden",
}

const ProfileSettings = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [userInfo, setUserInfo] = useState({ display_name: "", email: "", avatar: "" })
    const [editingName, setEditingName] = useState(false)
    const [draftName, setDraftName] = useState("")
    const [avatarSrc, setAvatarSrc] = useState(undefined)
    const [avatarFile, setAvatarFile] = useState(null)
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileDirty, setProfileDirty] = useState(false)

    const [pwLoading, setPwLoading] = useState(false)
    const [pwMsg, setPwMsg] = useState("")

    // "granted" | "denied" | "prompt" | "unsupported"
    const [locationPermission, setLocationPermission] = useState("prompt")
    const [locationLoading, setLocationLoading] = useState(false)
    const [locationUpdated, setLocationUpdated] = useState(false)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState("")
    const [deleting, setDeleting] = useState(false)

    const [loggingOut, setLoggingOut] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" })

    const showSnackbar = (msg, severity = "success") => setSnackbar({ open: true, msg, severity })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = getAuthToken()
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    withCredentials: true,
                    ...(token && { headers: { Authorization: `Bearer ${token}` } })
                })
                setUserInfo(res.data)
                setDraftName(res.data.display_name || "")
                setAvatarSrc(res.data.avatar || undefined)
            } catch (err) {
                console.error("Failed to fetch profile:", err)
            }
        }
        fetchProfile()

        if (!("geolocation" in navigator)) {
            setLocationPermission("unsupported")
            return
        }
        if ("permissions" in navigator) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                setLocationPermission(result.state)
                result.onchange = () => setLocationPermission(result.state)
            })
        }
    }, [])

    const handleRequestLocation = () => {
        setLocationLoading(true)
        setLocationUpdated(false)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                localStorage.setItem("userLocation", JSON.stringify(coords))
                localStorage.removeItem("restaurantCache")
                setLocationPermission("granted")
                setLocationUpdated(true)
                setLocationLoading(false)
                showSnackbar("Location updated — new recommendations will load on your next visit.")
            },
            () => {
                setLocationPermission("denied")
                setLocationLoading(false)
                showSnackbar("Location access was denied. Check your browser settings.", "error")
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        setProfileDirty(true)
        const reader = new FileReader()
        reader.onload = () => setAvatarSrc(reader.result)
        reader.readAsDataURL(file)
    }

    const handleSaveProfile = async () => {
        setSavingProfile(true)
        try {
            const formData = new FormData()
            formData.append("display_name", draftName)
            if (avatarFile) formData.append("avatar", avatarFile)
            const token = getAuthToken()
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, formData, {
                withCredentials: true,
                headers: { ...(token && { Authorization: `Bearer ${token}` }), "Content-Type": "multipart/form-data" }
            })
            setUserInfo(prev => ({ ...prev, display_name: res.data.display_name, avatar: res.data.avatar }))
            setAvatarFile(null)
            setEditingName(false)
            setProfileDirty(false)
            showSnackbar("Profile updated successfully")
        } catch (err) {
            showSnackbar("Failed to save profile.", "error")
        } finally {
            setSavingProfile(false)
        }
    }

    const handleRequestPasswordChange = async () => {
        setPwLoading(true)
        setPwMsg("")
        try {
            const token = getAuthToken()
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/request-password-change`,
                {},
                { withCredentials: true, ...(token && { headers: { Authorization: `Bearer ${token}` } }) }
            )
            setPwMsg(res.data.msg)
        } catch (err) {
            showSnackbar(err.response?.data?.msg || "Failed to send email.", "error")
        } finally {
            setPwLoading(false)
        }
    }

    const handleLogout = () => {
        setLoggingOut(true)
        setTimeout(() => {
            localStorage.removeItem("restaurantCache")
            localStorage.removeItem("genreCache")
            localStorage.removeItem("userLocation")
            localStorage.removeItem("ipLocation")
            localStorage.removeItem("spotify_access_token")
            localStorage.removeItem("spotify_refresh_token")
            localStorage.removeItem("app_token")
            localStorage.removeItem("token")
            sessionStorage.removeItem("hasSeenLoadingScreen")
            navigate("/")
        }, 1400)
    }

    const handleDeleteAccount = async () => {
        setDeleting(true)
        try {
            const token = getAuthToken()
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/account`, {
                withCredentials: true,
                ...(token && { headers: { Authorization: `Bearer ${token}` } })
            })
            setDeleteOpen(false)
            setLoggingOut(true)
            setTimeout(() => {
                localStorage.clear()
                sessionStorage.clear()
                navigate("/")
            }, 1400)
        } catch (err) {
            showSnackbar(err.response?.data?.msg || "Failed to delete account.", "error")
            setDeleting(false)
        }
    }

    const canDelete = deleteConfirm === "DELETE"

    const locationState = {
        granted: { label: "Enabled", color: "#2e7d32", chipBg: "rgba(46,125,50,0.1)", icon: <LocationOnIcon sx={{ color: "#2e7d32", fontSize: 24 }} />, btnText: locationUpdated ? "Updated" : "Refresh location", canPress: !locationUpdated },
        denied:  { label: "Blocked", color: "#EF233C", chipBg: "rgba(239,35,60,0.1)", icon: <LocationOffIcon sx={{ color: "#EF233C", fontSize: 24 }} />, btnText: "Check browser settings", canPress: false },
        prompt:  { label: "Not set", color: "#888", chipBg: "rgba(0,0,0,0.07)", icon: <MyLocationIcon sx={{ color: "#888", fontSize: 24 }} />, btnText: "Allow location", canPress: true },
        unsupported: { label: "Unavailable", color: "#888", chipBg: "rgba(0,0,0,0.07)", icon: <LocationOffIcon sx={{ color: "#888", fontSize: 24 }} />, btnText: "Not supported", canPress: false },
    }
    const loc = locationState[locationPermission] ?? locationState.prompt

    return (
        <>
            {loggingOut && <LogoutScreen />}
            <Box sx={{ minHeight: "100vh", background: "linear-gradient(44deg, rgba(255,191,105,0.3), rgba(255,255,255,1) 70.71%)", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed" }}>

                <nav>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", px: "1rem", pt: "0.5rem" }}>
                        <Tooltip title="Back to home">
                            <IconButton onClick={() => navigate("/userHome")}>
                                <ArrowBackIcon sx={{ width: 34, height: 34, color: "#EF233C" }} />
                            </IconButton>
                        </Tooltip>
                        <Box sx={{ transform: "scale(0.6)", transformOrigin: "right center" }}>
                            <LogoWNote />
                        </Box>
                    </Stack>
                    <Typography sx={{ textAlign: "center", fontFamily: "'Tinos', serif", fontWeight: 700, color: "#EF233C", fontSize: { xs: "34px", sm: "46px" }, pb: "0.75rem", lineHeight: 1.1 }}>
                        Profile Settings
                    </Typography>
                </nav>

                <Box sx={{ maxWidth: 820, mx: "auto", px: { xs: 2, sm: 3 }, pb: 4, pt: 0 }}>

                    {/* Bento grid */}
                    <Box sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gridTemplateAreas: {
                            xs: `
                                "profile"
                                "connected"
                                "password"
                                "location"
                                "faq"
                                "logout"
                                "delete"
                            `,
                            sm: `
                                "profile connected"
                                "profile password"
                                "profile location"
                                "faq     logout"
                                "faq     delete"
                            `
                        }
                    }}>

                        {/* Profile — large card */}
                        <Box sx={{ ...card, gridArea: "profile", display: "flex", flexDirection: "column" }}>
                            <Typography fontWeight={700} fontSize="11px" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                                Profile
                            </Typography>

                            <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                <ButtonBase component="label" sx={{ borderRadius: "50%" }} aria-label="Change avatar">
                                    <Avatar src={avatarSrc || "/broken-image.jpg"} sx={{ width: 90, height: 90 }} />
                                    <Box sx={{
                                        position: "absolute", bottom: 2, right: 2,
                                        bgcolor: "#EF233C", borderRadius: "50%", width: 26, height: 26,
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        <EditIcon sx={{ color: "white", fontSize: 13 }} />
                                    </Box>
                                    <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleAvatarChange} />
                                </ButtonBase>
                                <Box sx={{ textAlign: "center" }}>
                                    <Typography fontWeight={700} fontSize="16px">{userInfo.display_name || "—"}</Typography>
                                    <Typography fontSize="13px" color="text.secondary">{userInfo.email}</Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ mb: 2.5 }} />

                            <Typography fontSize="12px" color="text.secondary" sx={{ mb: 0.5 }}>Username</Typography>
                            <TextField
                                fullWidth variant="outlined" size="small" sx={{ mb: 2 }}
                                value={editingName ? draftName : (userInfo.display_name || "")}
                                disabled={!editingName}
                                onChange={(e) => { setDraftName(e.target.value); setProfileDirty(true) }}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title={editingName ? "Done" : "Edit username"}>
                                                    <IconButton size="small" onClick={() => {
                                                        if (!editingName) setDraftName(userInfo.display_name || "")
                                                        else setProfileDirty(true)
                                                        setEditingName(v => !v)
                                                    }}>
                                                        {editingName ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            <Typography fontSize="12px" color="text.secondary" sx={{ mb: 0.5 }}>Email</Typography>
                            <TextField fullWidth variant="outlined" size="small" value={userInfo.email || ""} disabled sx={{ mb: 2.5 }} />

                            <Box sx={{ mt: "auto" }}>
                                <Button
                                    variant="contained" color="mainRed" onClick={handleSaveProfile}
                                    disabled={savingProfile || !profileDirty} fullWidth
                                    sx={{ color: "white", borderRadius: "36px", textTransform: "none", fontSize: "14px", height: "40px", boxShadow: 0, "&:hover": { boxShadow: 0 } }}
                                >
                                    {savingProfile ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Save Changes"}
                                </Button>
                            </Box>
                        </Box>

                        {/* Connected */}
                        <Box sx={{ ...card, gridArea: "connected" }}>
                            <Typography fontWeight={700} fontSize="11px" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
                                Connected
                            </Typography>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <MusicNoteIcon sx={{ color: "#1DB954", fontSize: 26 }} />
                                    <Box>
                                        <Typography fontWeight={600} fontSize="14px">Spotify</Typography>
                                        <Typography fontSize="12px" color="text.secondary" noWrap>
                                            {userInfo.email || "Connected"}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Chip label="Active" size="small" sx={{ bgcolor: "rgba(29,185,84,0.12)", color: "#1DB954", fontWeight: 700, fontSize: "11px" }} />
                            </Stack>
                        </Box>

                        {/* Security */}
                        <Box sx={{ ...card, gridArea: "password" }}>
                            <Typography fontWeight={700} fontSize="11px" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
                                Security
                            </Typography>
                            <Typography fontWeight={600} fontSize="14px" sx={{ mb: 0.5 }}>Change Password</Typography>
                            <Typography fontSize="12px" color="text.secondary" sx={{ mb: 1.5 }}>
                                {pwMsg || "Send a reset link to your email."}
                            </Typography>
                            <Button
                                variant="outlined" size="small" startIcon={<LockOutlinedIcon />}
                                onClick={handleRequestPasswordChange} disabled={pwLoading || !!pwMsg} fullWidth
                                sx={{ borderColor: "#EF233C", color: "#EF233C", borderRadius: "36px", textTransform: "none", fontSize: "13px", "&:hover": { borderColor: "#EF233C", bgcolor: "rgba(239,35,60,0.04)" } }}
                            >
                                {pwLoading ? <CircularProgress size={16} sx={{ color: "#EF233C" }} /> : "Send reset email"}
                            </Button>
                        </Box>

                        {/* Location */}
                        <Box sx={{ ...card, gridArea: "location" }}>
                            <Typography fontWeight={700} fontSize="11px" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
                                Location
                            </Typography>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    {loc.icon}
                                    <Box>
                                        <Typography fontWeight={600} fontSize="14px">Location Access</Typography>
                                        <Typography fontSize="12px" sx={{ color: loc.color }}>{loc.label}</Typography>
                                    </Box>
                                </Stack>
                                <Chip label={loc.label} size="small" sx={{ bgcolor: loc.chipBg, color: loc.color, fontWeight: 700, fontSize: "11px" }} />
                            </Stack>
                            {locationPermission === "denied" ? (
                                <Typography fontSize="12px" color="text.secondary">
                                    Enable location in your browser's site settings, then refresh.
                                </Typography>
                            ) : (
                                <Button
                                    variant="outlined" size="small" startIcon={<MyLocationIcon />}
                                    onClick={handleRequestLocation}
                                    disabled={locationLoading || !loc.canPress} fullWidth
                                    sx={{ borderColor: loc.color, color: loc.color, borderRadius: "36px", textTransform: "none", fontSize: "13px", "&:hover": { borderColor: loc.color, bgcolor: `${loc.chipBg}` } }}
                                >
                                    {locationLoading ? <CircularProgress size={16} sx={{ color: loc.color }} /> : loc.btnText}
                                </Button>
                            )}
                        </Box>

                        {/* FAQ */}
                        <Box sx={{ ...card, gridArea: "faq" }}>
                            <Typography fontWeight={700} fontSize="11px" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", mb: 1 }}>
                                Help & FAQ
                            </Typography>
                            {FAQ.map((item, i) => (
                                <Accordion
                                    key={i} disableGutters elevation={0}
                                    sx={{ "&:before": { display: "none" }, borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.06)" }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#EF233C", fontSize: 18 }} />} sx={{ px: 0, minHeight: "40px", "& .MuiAccordionSummary-content": { my: "8px" } }}>
                                        <Typography fontWeight={600} fontSize="13px">{item.q}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
                                        <Typography fontSize="12px" color="text.secondary">{item.a}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>

                        {/* Log out */}
                        <Box sx={{ ...card, gridArea: "logout" }}>
                            <Typography fontWeight={700} fontSize="11px" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
                                Session
                            </Typography>
                            <Typography fontWeight={600} fontSize="14px" sx={{ mb: 0.5 }}>Log Out</Typography>
                            <Typography fontSize="12px" color="text.secondary" sx={{ mb: 1.5 }}>Sign out on this device.</Typography>
                            <Button
                                variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={handleLogout} fullWidth
                                sx={{ borderColor: "rgba(0,0,0,0.2)", color: "#333", borderRadius: "36px", textTransform: "none", fontSize: "13px", "&:hover": { borderColor: "#333", bgcolor: "rgba(0,0,0,0.03)" } }}
                            >
                                Log out
                            </Button>
                        </Box>

                        {/* Delete */}
                        <Box sx={{ ...card, gridArea: "delete", bgcolor: "rgba(239,35,60,0.04)", border: "2px solid rgba(239,35,60,0.2)" }}>
                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
                                <WarningAmberIcon sx={{ color: "error.main", fontSize: 15 }} />
                                <Typography fontWeight={700} fontSize="11px" color="error" sx={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Danger Zone
                                </Typography>
                            </Stack>
                            <Typography fontWeight={600} fontSize="14px" sx={{ mb: 0.5 }}>Delete Account</Typography>
                            <Typography fontSize="12px" color="text.secondary" sx={{ mb: 1.5 }}>Permanently deletes all your data.</Typography>
                            <Button
                                variant="outlined" size="small" startIcon={<DeleteOutlineIcon />}
                                onClick={() => { setDeleteOpen(true); setDeleteConfirm("") }} fullWidth
                                sx={{ borderColor: "#EF233C", color: "#EF233C", borderRadius: "36px", textTransform: "none", fontSize: "13px", "&:hover": { borderColor: "#EF233C", bgcolor: "rgba(239,35,60,0.08)" } }}
                            >
                                Delete account
                            </Button>
                        </Box>


                    </Box>
                </Box>
            </Box>

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteOpen}
                onClose={() => !deleting && setDeleteOpen(false)}
                PaperProps={{ sx: { borderRadius: "16px", p: 1, width: { xs: "90vw", sm: "420px" } } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: "#EF233C", fontSize: "20px" }}>Delete account?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: "#555", fontSize: "14px", mb: 2 }}>
                        This will permanently delete your account, saved restaurants, and all lists. <strong>This cannot be undone.</strong>
                    </Typography>
                    <Typography sx={{ fontSize: "14px", mb: 1 }}>Type <strong>DELETE</strong> to confirm:</Typography>
                    <TextField
                        fullWidth variant="outlined" size="small" autoComplete="off"
                        value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setDeleteOpen(false)} disabled={deleting} sx={{ borderRadius: "36px", textTransform: "none", color: "#555" }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained" onClick={handleDeleteAccount} disabled={!canDelete || deleting}
                        sx={{ bgcolor: "#EF233C", color: "white", borderRadius: "36px", textTransform: "none", boxShadow: 0, "&:hover": { bgcolor: "#c41d30", boxShadow: 0 }, "&.Mui-disabled": { bgcolor: "rgba(239,35,60,0.3)", color: "white" } }}
                    >
                        {deleting ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Delete account"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
        </>
    )
}

export default ProfileSettings
