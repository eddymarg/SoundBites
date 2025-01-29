import React from "react"
import { Stack, Button, Typography, Avatar } from "@mui/material"
import EmailIcon from '@mui/icons-material/Email';
import HomeHeader from "../components/homeHeader"
import { NoteLogo } from "../assets/noteLogo"
import '@fontsource/roboto/500.css'
import "../css/home.css"

const Home = () => {
    return(
        <div>
            <HomeHeader />
            {/* Sign up stuff */}
            <Stack>
                <Stack direction="column" spacing={3} alignItems={"center"}>
                    <NoteLogo/>
                    <Typography fontSize='44px' textAlign={"center"}>
                        Join for <span style={{ fontFamily: "'Tinos', serif", fontWeight: 700, fontStyle:'italic', color: '#EF233C'}}>food</span> that's truly <br /><span style={{ fontFamily: "'Tinos', serif", fontWeight: 700, fontStyle:'italic', color: '#EF233C'}}>music to your ears</span>
                    </Typography>
                    <Button variant="contained" color="basic" startIcon={<Avatar src={'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png'} sx={{ width: 24, height: 24  }}/>}
                    sx={{
                        width: '525px',
                        height: '70px',
                        color: '#0D1B2A',
                        fontSize: '24px',
                        borderRadius: '36px',
                        boxShadow: '-8px 8px 0 #EF233C',
                        textTransform: "none",
                        '&:hover': {
                            boxShadow: 'none'
                        }
                    }}
                    >
                        Continue with Spotify
                    </Button>
                    <Button variant="contained" color="basic" startIcon={<EmailIcon/>}
                    sx={{
                        width: '525px',
                        height: '70px',
                        color: '#0D1B2A',
                        fontSize: '24px',
                        borderRadius: '36px',
                        boxShadow: '-8px 8px 0 #EF233C',
                        textTransform: "none",
                        '&:hover': {
                            boxShadow: 'none'
                        }
                    }}
                    >
                        Continue with Email
                    </Button>
                </Stack>
            </Stack>
        </div>
    )
}

export default Home;