import React, { useEffect, useRef } from "react"
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
        <div style={{ scrollBehavior: 'smooth'}}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 1000}}>
                <HomeHeader />
            </Box>
            {/* Sign up stuff */}
            <Box id='top-section' sx={{ position: 'relative', minHeight: '100vh', scrollMarginTop: '10rem'}}>
                <Box sx={{ top: 0, left: 0, width: '100%', zIndex: -1}}>
                    <Box>
                        <img 
                            src={foodBowl1} 
                            style={{ width: '26vw', position: 'absolute',top: 10, left: -100, zIndex: 1,}}
                        />
                        <img 
                            src={foodBowl2} 
                            style={{ width: '40vw', position: 'absolute', top: 150, left: -250, zIndex: 0,
                            }}
                        />
                        <img 
                            src={foodBowl3} 
                            style={{ width: '18vw', position: 'absolute', top: 350, left: '-40px', zIndex: -1,
                            }}
                        />
                    </Box>
                    {/* mirrored side */}
                    <Box sx={{ position: 'relative', top: 0, right: 0, transform: 'scaleX(-1)'}}>
                        <img 
                            src={foodBowl3} 
                            style={{ width: '18vw', position: 'absolute', top: 350, left: -100, zIndex: -1,
                            }}
                        />
                        <img 
                            src={foodBowl2} 
                            style={{ width: '40vw', 
                                position: 'absolute', top: 150, left: -250, zIndex: 0,
                            }}
                        />
                        <img 
                            src={foodBowl1} 
                            style={{ width: '26vw', position: 'absolute', top: 10, left: '-40px', zIndex: 1,
                            }}
                        />
                    </Box>
                </Box>
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
                    onClick={() => {
                        window.location.href = "http://localhost:5001/auth/spotify/login"
                    }}
                    >
                        Continue with Spotify
                    </Button>
                </Stack>
            </Box>
                <Box id='about-section' sx={{marginTop: '5rem', scrollMarginTop: '5rem', minHeight: '100vh'}}>
                    <Stack direction="row" sx={{ padding: '1rem', justifyContent: 'center', alignItems: 'center'}}>
                        <AboutImgs />
                        <Stack>
                            <AboutSubtitle />
                            <Typography sx={{ maxWidth: '30vw', padding: '1rem', marginLeft: '3rem'}}>
                                We believe food tastes even better when it’s paired with the right vibe. That’s why we created a platform that blends two of life’s greatest joys: music and meals. <br />
                                Whether you’re in the mood for a cozy jazz bar, a high-energy spot that matches your EDM playlists, or a laid-back café with acoustic vibes, SoundBites serves up restaurant recommendations that match your taste in both food and sound. <br />
                                Think of it as your personal DJ and food guide rolled into one. <br />
                                Hungry? Let’s find your flavor in harmony.
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
        </div>
    )
}

export default Home;