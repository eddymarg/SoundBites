"use client"
import { Box } from "@mui/material"
import { useState } from "react"
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps"
import Grid from '@mui/material/Grid'
import LoggedInHeader from "../components/loggedinHeader"

const userHome = () => {
    const position = { lat: 53.54, lng: 10 }
    return(
        <APIProvider apiKey={import.meta.GOOGLE_MAP_API_KEY}>
            <div>
                <LoggedInHeader/>
                <Grid container sx={{ height: "100vh"}}>
                    <Grid item xs={12} md={6}>
                        
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ height: '100%'}}>
                            <Map zoom={9} center={position}></Map>
                        </Box>
                    </Grid>
                </Grid>
            </div>
        </APIProvider>
    )
}

export default userHome