// Deals with logic and displaying of all 
// restaurant recommendations

import { Box, Button, Typography, Stack, Rating, IconButton } from "@mui/material"
import { useEffect } from "react"
import '../css/googleModal.css'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';


const RestaurantList = ({ restaurants, handleLoadMore, hasMore, handleLocationClick, savedIds, bookmarkToggle }) => {
    const priceLevels = ["$", "$$", "$$$", "$$$$"]

    return (
        <>
            {/* <h2 className="text-xl font-bold">Nearby {genre} Restaurants</h2> */}
            {restaurants.length === 0 && <p>No restaurants found.</p>}
            <ul>
                {restaurants.map((resto, index) => (
                <Box 
                    key={index} 
                    sx={{
                        display: "flex",
                        alignItems: 'center',
                        backgroundColor: "#ffffff",
                        padding: "20px",
                        borderRadius: "36px",
                        marginBottom: "10px",
                        "&:hover": {
                            backgroundColor: "#EF233C20",
                            border: "1.5px solid #EF233C",
                        }
                    }}
                    onClick={()=>handleLocationClick(resto)}
                >
                    <Box sx={{ width: '120px', height: '120px', mr: 2}}>
                        <img
                            src ={resto.photo} 
                            alt ={resto.name} 
                            style ={{
                                width: "112px", 
                                height: "112px",
                                borderRadius: "28px", 
                            }}
                        />
                    </Box>
                    <Stack spacing={1} sx={{ flexGrow: 1}}>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Typography 
                                variant="h6" 
                                component="strong" 
                                style={{
                                    fontFamily: "'Tinos', serif", fontWeight: "700"
                                }}>
                                    {resto.name}
                            </Typography>
                            <IconButton onClick={(e) => {
                                e.stopPropagation()
                                bookmarkToggle(resto)
                            }}>
                                {savedIds.includes(resto.place_id) ? (
                                    <BookmarkAddedIcon sx={{ color: "#EF233C", fontSize: "35px" }} />
                                ) : (
                                    <BookmarkBorderIcon sx={{ color: "#FFBF69", fontSize: "35px"}}/>
                                )}
                            </IconButton>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" marginRight={1}>
                                {resto.rating}
                            </Typography>
                            <Rating 
                                name={`restaurant-rate-${resto.id}-${index}`} 
                                readOnly
                                value={Number(resto.rating)} 
                                precision={0.1}
                            />
                            <Typography variant="body1" marginLeft={2}>{priceLevels[resto.price_level]}</Typography>
                        </Box>
                        <Typography variant="body-2">{resto.address}</Typography>
                    </Stack>
                </Box>
                ))}
            </ul>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                marginTop="2rem"
            >
                <Button variant="outlined" color="mainRed" 
                sx={{
                    borderRadius: "36px",
                    border: "2px solid",
                    backgroundColor: "white",
                    fontSize: "20px",
                    textTransform: "none",
                    width: "260px",
                    "&:hover": {
                        backgroundColor: "#EF233C20",
                    }
                }}
                onClick={handleLoadMore}
                >Load More</Button>
            </Box>
        </>
    )
}

export default RestaurantList