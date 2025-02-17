import React, { useEffect, useRef } from "react"
import { Stack, Button, Typography, Avatar, Box } from "@mui/material"
import { useNavigate } from "react-router-dom"
import EmailIcon from '@mui/icons-material/Email';
import HomeHeader from "../components/homeHeader"
import { NoteLogo } from "../assets/noteLogo"
import '@fontsource/roboto/500.css'
import "../css/home.css"
import foodBowl1 from "../assets/foodBowl1.png"
import foodBowl2 from "../assets/foodBowl2.png"
import foodBowl3 from "../assets/foodBowl3.png"
import { throttle } from "lodash";

const Home = () => {
    const navigate = useNavigate()
    const bowl1Ref = useRef(null)
    const bowl2Ref = useRef(null)
    const bowl3Ref = useRef(null)
    const mirrorBowl1Ref = useRef(null)
    const mirrorBowl2Ref = useRef(null)
    const mirrorBowl3Ref = useRef(null)

    useEffect(() => {
        const handleScroll = throttle(() => {
            const scrollY = window.scrollY

            bowl1Ref.current.style.transform = `rotate(${scrollY * 0.1}deg)`
            bowl2Ref.current.style.transform = `rotate(${scrollY * -0.15}deg)`
            bowl3Ref.current.style.transform = `rotate(${scrollY * 0.2}deg)`
            mirrorBowl1Ref.current.style.transform = `rotate(${scrollY * -0.1}deg)`
            mirrorBowl2Ref.current.style.transform = `rotate(${scrollY * 0.15}deg)`
            mirrorBowl3Ref.current.style.transform = `rotate(${scrollY * -0.2}deg)`
        }, 20)

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return(
        <div style={{ scrollBehavior: 'smooth'}}>
            <HomeHeader />
            {/* Sign up stuff */}
            <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden'}}>
                <Box sx={{ position: 'absolute',top: 0, left: 0, width: '100%', zIndex: -1}}>
                    <Box sx={{ position: 'relative'}}>
                        <img 
                            ref={bowl1Ref}
                            src={foodBowl1} 
                            style={{ 
                                width: '26vw', 
                                position: 'absolute', 
                                top: 10, 
                                left: -100, 
                                zIndex: 1,
                                transition: "transform 0.1s linear",
                            }}
                        />
                        <img 
                            ref={bowl2Ref}
                            src={foodBowl2} 
                            style={{ 
                                width: '40vw', 
                                position: 'absolute', 
                                top: 150, 
                                left: -250, 
                                zIndex: 0,
                                transition: "transform 0.1s linear",
                            }}
                        />
                        <img 
                            ref={bowl3Ref}
                            src={foodBowl3} 
                            style={{ 
                                width: '18vw', 
                                position: 'absolute', 
                                top: 350, 
                                left: '-40px', 
                                zIndex: -1,
                                transition: "transform 0.1s linear",
                            }}
                        />
                    </Box>
                    {/* mirrored side */}
                    <Box sx={{ position: 'relative', top: 0, right: 0, transform: 'scaleX(-1)'}}>
                        <img 
                            ref={mirrorBowl1Ref}
                            src={foodBowl3} 
                            style={{ 
                                width: '18vw', 
                                position: 'absolute', 
                                top: 350, 
                                left: -100,
                                zIndex: -1,
                                transition: "transform 0.1s linear",
                            }}
                        />
                        <img 
                            ref={mirrorBowl2Ref}
                            src={foodBowl2} 
                            style={{ 
                                width: '40vw', 
                                position: 'absolute', 
                                top: 150, 
                                left: -250,
                                zIndex: 0,
                                transition: "transform 0.1s linear",
                            }}
                        />
                        <img 
                            ref={mirrorBowl3Ref}
                            src={foodBowl1} 
                            style={{ 
                                width: '26vw', 
                                position: 'absolute', 
                                top: 10, 
                                left: '-40px',
                                zIndex: 1,
                                transition: "transform 0.1s linear",
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
                        window.location.href = "https://localhost:5001/auth/spotify/callback"
                    }}
                    >
                        Continue with Spotify
                    </Button>
                    <Button variant="contained" color="basic" startIcon={<EmailIcon/>} onClick={() => navigate("/EmailSignup")}
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
            </Box>
            <Box id='about-section'
            >
                <Typography variant="h2" sx={{ mb: 2 }}>
                    About Us
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "20px", textAlign: "center" }}>
                Welcome to Our Amazing Website!

                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sollicitudin dui nec eros cursus, sit amet tincidunt orci placerat. Donec a erat ligula. Quisque sed varius ex. Phasellus non ultricies turpis, a ullamcorper ipsum. Fusce lacinia magna nec leo gravida, et lacinia sapien mollis. Mauris euismod justo vitae sapien auctor, at efficitur orci efficitur. Suspendisse euismod erat a nunc posuere, in vestibulum ante volutpat.

                Pellentesque quis urna sed felis vulputate malesuada ac id nunc. Fusce in nisi vitae odio iaculis dapibus. Etiam nec scelerisque nisi, ut suscipit tortor. Donec sagittis felis et tincidunt vestibulum. Nullam a diam sit amet turpis tincidunt volutpat. Curabitur scelerisque odio at risus volutpat, a fermentum turpis consequat. Ut sed nulla mauris. Aenean vel sapien sit amet lectus tincidunt dignissim ut nec eros.

                Our Mission

                Praesent at velit nulla. Ut vel maximus felis. Proin condimentum dolor leo, et luctus nisi sollicitudin eu. Cras efficitur libero eu sem dictum, ut aliquet ante lacinia. In vel eros ut velit lacinia euismod. Maecenas nec feugiat purus, in sollicitudin erat. In sagittis, orci ac maximus cursus, velit libero lacinia enim, sed scelerisque turpis enim eu elit. In varius enim vel lacus tincidunt, ac vestibulum tortor dapibus.

                Our Products

                Product A - Nulla a tincidunt nisl. Mauris vestibulum nisi ut nunc maximus, at tempor metus cursus.
                Product B - Ut sed massa vel nisi vulputate auctor. Integer vestibulum, felis sit amet aliquam ultricies, orci nisl aliquam felis.
                Product C - Nam eget orci sed lorem luctus lacinia ut id risus. Fusce at orci ac dui rutrum vehicula.
                Fusce sollicitudin dui sed nisi rutrum, vel condimentum nunc fermentum. Sed mollis, purus at facilisis suscipit, elit turpis viverra urna, id convallis neque erat a magna.

                Contact Us

                Address: 123 Fake Street, Imaginary City, 00001
                Phone: (123) 456-7890
                Email: support@fakeemail.com
                Curabitur dictum, arcu sit amet venenatis rhoncus, dui justo volutpat ligula, vel viverra odio eros eu justo. Sed vehicula, lorem sit amet eleifend scelerisque, ligula tortor vehicula leo, ac rutrum orci metus et risus.

                Donec sit amet arcu at odio fermentum pretium et non ligula. Cras hendrerit lacus in lorem facilisis, et efficitur lectus interdum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus cursus dui ac diam aliquet, non fringilla turpis cursus. Proin consequat nulla at felis dictum, vel pretium justo posuere.
                </Typography>
            </Box>
        </div>
        
    )
}

export default Home;