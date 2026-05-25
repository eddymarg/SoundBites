import React from "react"
import { Stack, Button, Typography, Avatar, Box } from "@mui/material"
import HomeHeader from "../components/homeHeader"
import { NoteLogo } from "../assets/noteLogo"
import { AboutImgs } from "../assets/about-imgs"
import { AboutSubtitle } from "../assets/AboutSubtitle"
import '@fontsource/roboto/500.css'
import "../css/home.css"
import foodBowl1 from "../assets/foodBowl1.png"
import foodBowl2 from "../assets/foodBowl2.png"
import foodBowl3 from "../assets/foodBowl3.png"

const Home = () => {
    return(
        <div>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 1000}}>
                <HomeHeader />
            </Box>
            {/* Sign up stuff */}
            <Box id='top-section' sx={{ position: 'relative', minHeight: '100vh', scrollMarginTop: '10rem'}}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                    <Box>
                        <Box component="img" src={foodBowl1}
                            sx={{ width: { xs: '26vw', md: '26vw' }, position: 'absolute', top: { xs: 4, md: 10 }, left: { xs: '-43px', md: '-100px' }, zIndex: 1 }}
                        />
                        <Box component="img" src={foodBowl2}
                            sx={{ width: { xs: '40vw', md: '40vw' }, position: 'absolute', top: { xs: 64, md: 150 }, left: { xs: '-108px', md: '-250px' }, zIndex: 0 }}
                        />
                        <Box component="img" src={foodBowl3}
                            sx={{ width: { xs: '18vw', md: '18vw' }, position: 'absolute', top: { xs: 150, md: 350 }, left: { xs: '-17px', md: '-40px' }, zIndex: -1 }}
                        />
                    </Box>
                    {/* mirrored side */}
                    <Box sx={{ position: 'relative', top: 0, right: 0, transform: 'scaleX(-1)'}}>
                        <Box component="img" src={foodBowl3}
                            sx={{ width: { xs: '18vw', md: '18vw' }, position: 'absolute', top: { xs: 150, md: 350 }, left: { xs: '-43px', md: '-100px' }, zIndex: -1 }}
                        />
                        <Box component="img" src={foodBowl2}
                            sx={{ width: { xs: '40vw', md: '40vw' }, position: 'absolute', top: { xs: 64, md: 150 }, left: { xs: '-108px', md: '-250px' }, zIndex: 0 }}
                        />
                        <Box component="img" src={foodBowl1}
                            sx={{ width: { xs: '26vw', md: '26vw' }, position: 'absolute', top: { xs: 4, md: 10 }, left: { xs: '-17px', md: '-40px' }, zIndex: 1 }}
                        />
                    </Box>
                </Box>
                <Stack direction="column" spacing={3} alignItems={"center"} sx={{ px: { xs: 2, sm: 4 } }}>
                    <NoteLogo/>
                    <Typography fontSize={{ xs: '28px', sm: '36px', md: '44px' }} textAlign={"center"}>
                        Join for <span style={{ fontFamily: "'Tinos', serif", fontWeight: 700, fontStyle:'italic', color: '#EF233C'}}>food</span> that's truly <br /><span style={{ fontFamily: "'Tinos', serif", fontWeight: 700, fontStyle:'italic', color: '#EF233C'}}>music to your ears</span>
                    </Typography>
                    <Button variant="contained" color="basic" startIcon={<Avatar src={'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png'} sx={{ width: 24, height: 24  }}/>}
                    sx={{
                        width: { xs: '90vw', sm: '420px', md: '525px' },
                        height: { xs: '56px', sm: '64px', md: '70px' },
                        color: '#0D1B2A',
                        fontSize: { xs: '18px', sm: '20px', md: '24px' },
                        borderRadius: '36px',
                        boxShadow: '-8px 8px 0 #EF233C',
                        textTransform: "none",
                        '&:hover': {
                            boxShadow: 'none'
                        }
                    }}
                    onClick={() => {
                        window.location.href = `${import.meta.env.VITE_API_URL}/auth/spotify/login`
                    }}
                    >
                        Continue with Spotify
                    </Button>
                </Stack>
            </Box>
                <Box id='about-section' sx={{ scrollMarginTop: '5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ width: '100%', padding: { xs: '2rem 1rem', md: '2rem' }, justifyContent: 'center', alignItems: 'center', gap: { xs: 4, md: 0 } }}>
                        <AboutImgs />
                        <Stack sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
                            <AboutSubtitle />
                            <Typography sx={{ maxWidth: { xs: '90vw', sm: '70vw', md: '30vw' }, padding: '1rem', marginLeft: { xs: 0, md: '3rem' }, textAlign: { xs: 'center', md: 'left' } }}>
                                We believe food tastes even better when it's paired with the right vibe. That's why we created a platform that blends two of life's greatest joys: music and meals. <br />
                                Whether you're in the mood for a cozy jazz bar, a high-energy spot that matches your EDM playlists, or a laid-back café with acoustic vibes, SoundBites serves up restaurant recommendations that match your taste in both food and sound. <br />
                                Think of it as your personal DJ and food guide rolled into one. <br />
                                Hungry? Let's find your flavor in harmony.
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
        </div>
    )
}

export default Home;