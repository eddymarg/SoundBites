import { useState, useEffect } from "react"
import LoadingAnimation from "./loadingAnimation"
import { Box, Stack, Typography } from "@mui/material"
import "../css/loading.css"

const LogoutScreen = () => {
    const [stage, setStage] = useState(0)

    const logoutText = [
        "Saving your progress...",
        "Logging you out...",
        "See you next time!"
    ]

    useEffect(() => {
        const t1 = setTimeout(() => setStage(1), 400)
        const t2 = setTimeout(() => setStage(2), 900)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    return (
        <Box className="logout-screen-container">
            <Box className="loading-animation">
                <LoadingAnimation />
            </Box>
            <Stack spacing={1} alignItems="center" className="loading-text-container">
                {logoutText.map((text, index) => (
                    <Typography
                        key={index}
                        className="loading-text"
                        style={{
                            fontFamily: "Tinos, serif",
                            fontWeight: 700,
                            fontSize: 20,
                            color: stage === index ? "#EF233C" : "#E5E5E5",
                            transition: "color 0.3s ease"
                        }}
                    >
                        {text}
                    </Typography>
                ))}
            </Stack>
        </Box>
    )
}

export default LogoutScreen
