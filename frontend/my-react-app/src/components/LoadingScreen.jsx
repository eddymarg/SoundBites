import React, { useEffect } from "react"
import { useState } from "react"
import LoadingAnimation from "./loadingAnimation"
import { Box, Stack, Typography } from "@mui/material"
import "../css/loading.css"

const LoadingScreen = ({ loadingStage, topGenres = [] }) => {
    const loadingText = [
        "Analyzing Spotify...",
        "Let it cook...",
        "Order up!"
    ]

    const genreLabel = topGenres.length > 0
        ? topGenres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(' · ')
        : null

    return(
        <Box className="loading-screen-container">
            <Box className="loading-animation">
                <LoadingAnimation />
            </Box>
            <Stack spacing={1} alignItems="center" className="loading-text-container">
                {loadingText.map((text, index) => (
                    <Typography
                        key={index}
                        className="loading-text"
                        style={{
                            fontFamily: "Tinos, serif",
                            fontWeight: 700,
                            fontSize: 20,
                            color: loadingStage === index ? "#EF233C" : "#E5E5E5",
                            transition: "color 0.3s ease"
                        }}
                    >
                        {text}
                    </Typography>
                ))}
            </Stack>
            {genreLabel && (
                <Typography
                    style={{
                        fontFamily: "Tinos, serif",
                        fontSize: 15,
                        color: "#aaa",
                        marginTop: "1.5rem",
                        textAlign: "center",
                        opacity: loadingStage >= 1 ? 1 : 0,
                        transition: "opacity 0.6s ease",
                        maxWidth: "320px",
                        lineHeight: 1.6,
                    }}
                >
                    Finding spots that match your{" "}
                    <span style={{ color: "#EF233C", fontWeight: 700 }}>{genreLabel}</span>{" "}
                    taste
                </Typography>
            )}
        </Box>
    )
}

export default LoadingScreen
