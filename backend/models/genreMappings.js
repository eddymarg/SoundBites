const { Settings } = require("@mui/icons-material")
const { set } = require("lodash")

const genreMappings = {
    "A Capella": {
        settings: ["Cafes", "Brunch Spots", "Garden Restaurant"],
        adjectives: ["Plant-filled", "Soft-decor"]
    },
    "Abstract": {
        settings: ["Artsy Cafes", "Experimental Restaurants", "Lounge Bards"
        ],
        adjectives: ["Introspective", "Avant-garde"]
    },
    "Abstract Beats": {
        settings: ["Food Halls", "Fusion Restaurants", "Tapas Bars"],
        adjectives: ["Chaotic", "Unconventional"]
    },
    "Abstract Hip Hop": {
        settings: ["Speakeasy", "Vinyl Bars", "Speakeasy"],
        adjectives: ["Surrealistic", "Complex"]
    },
    "Abstract IDM": {
        settings: ["Multi-sensory dining", "Tea Ceremony Cafes", "Listening Bars"],
        adjectives: ["Exploratory", "Intricate"]
    },
    "Abstracto": {
        settings: ["Street Food", "Pop-up Kitchens", "Fusion Spots"],
        adjectives: ["Unconventional", "Noisy"]
    },
    "Accordion": {
        settings: ["Family-Owned Restaurants", "Taverns", "European Bistro"],
        adjectives: ["Traditional", "Lively"]
    },
    "Acid House": {
        settings: ["Rooftop Bars", "Sensory Dining", "Themed Restaurants"],
        adjectives: ["Euphoric", "Psychedelic"]
    },
    "Acid Jazz": {
        settings: ["Retro Diners", "Listening Bars", "Art House Cafes"],
        adjectives: ["Funky", "Eclectic"]
    },
    "Acid Techno": {
        settings: ["Industrial-themed bars", "Food Trucks", "Noodle Shops"],
        adjectives: ["Fast", "Intense"]
    },
    "Acousmatic": {
        settings: ["Tea Rooms", "Forest-to-table", "Conceptual Fine Dining"],
        adjectives: ["Enchanting", "Mysterious"]
    },
    "Acoustic Blues": {
        settings: ["Soul Food", "Porch Dining", "Speakeasy Diners"],
        adjectives: ["Soulful", "Intimate"]
    },
    "Acoustic Pop": {
        settings: ["Health Cafes", "Beachside Grill", "Farm-to-table"],
        adjectives: ["Organic", "Laid-back"]
    },
    "Adult Standards": {
        settings: ["Wine Bars", "Steakhouses", "French Bistros"],
        adjectives: ["Classic, Clean"]
    },
    "African Percussion": {
        settings: ["Afro-Caribbean Restaurants, Communal Dining Halls, Open-Air Markets"],
        adjectives: ["Vibrant", "Communal"]
    },
    "African Rock": {
        settings: ["Urban Food Markets", "Street Food Trucks", "Late-night Lounges"],
        adjectives: ["Vibrant", "Edgy"]
    },
    "Afrikaans": {
        settings: ["Fusion Restaurants", "Pubs", "Artisanal Bakery"],
        adjectives: ["Diverse, Funky"]
    },
    "Afrobeat": {
        settings: ["Rooftop Bars", "Caribbean & West African Fusion Restaurants", "Food Halls"],
        adjectives: ["Energetic", "Diverse"]
    },
    "Afrobeats": {
        settings: ["Rooftop Bars", "Caribbean & West African Fusion Restaurants", "Food Halls"],
        adjectives: ["Energetic", "Diverse"]
    },
    "Aggrotech": {
        settings: ["Robotic kitchens", "Alt Cafes", "Industrial-themed bars"],
        adjectives: ["Intense", "Dystopian"]
    },
    "Albanian Pop": {
        settings: ["Balkan Fusion Restaurants", "Mediterannean Cafes", "Neo-Tavernas"],
        adjectives: ["Innovative", "Fresh"]
    },
    "Album Rock": {
        settings: ["Rock Diners", "Music Memorabilia Cafes", "Barbeque Smokehouse"],
        adjectives: ["Immersive", "Thematic"]
    },
    "Albuquerque Indie": {
        settings: ["Neighborhood Cafes", "Hole-in-the-wall eateries", "Indie bookstore cafes"],
        adjectives: ["Eclectic", "Authentic"]
    },
    "Alternative Americana": {
        settings: ["Roadside Diners", "Rustic Country Cafes", "Americana-themed saloons"],
        adjectives: ["Rustic", "Eclectic"]
    },
    "Alternative Country": {
        settings: ["Southern Smokehouses", "Country Kitchens", "Heritage-style diners"],
        adjectives: ["Authentic", "Roots"]
    },
    "Alternative Dance": {
        settings: ["Futuristic cocktail lounge", "Minimalist fusion kitchens", "Robotic restaurants"],
        adjectives: ["Experimental", "Electronic"]
    },
    "Alternative Emo": {
        settings: ["Indie Record Store Cafe", "Vintage Pizza Parlor", "Urban Dive Bars"],
        adjectives: ["Emotional", "Angsty"]
    },
    "Alternative Hardcore": {
        settings: ["Food Trucks", "Dive Bars", "Tattoo Parlor Coffee Shop"],
        adjectives: ["Fast", "Intentionally Aggressive"]
    },
    "Alternative Hip Hop": {
        settings: ["Fusion Restaurants", "Vegan Soul Food Joints", "Indie Food Markets"],
        adjectives: ["Experimental", "Diverse"]
    },
    "Alternative Metal": {
        settings: ["Industrial-themed gastropubs", "Experimental Smokehouses", "Grungy Cafes"],
        adjectives: ["Unconventional", "Range"]
    },
    "Alternative Metalcore": {
        settings: ["Late-night diner", "Rock Music Cafes", "Industrial Dive Bar"],
        adjectives: ["Distorted", "Heavy"]
    },
    "Alternative New Age": {
        settings: ["Plant-based Restaurants", "Tea Lounges", "Experimental Vegan Bistro"],
        adjectives: ["Ambient", "Harmonious"]
    },
    "Alternative Pop": {
        settings: ["Rooftop Cafes", "Art-forward Concept Restaurants", "Indie Brunch Cafes"],
        adjectives: ["Introspective", "Experimental"]
    },
    "Alternative Pop Rock": {
        settings: ["Trendy Burger Joints", "Urban Pizza Spots", "Record Cafes"],
        adjectives: ["Addicting", "Melodic"]
    },
    "Alternative R&B": {
        settings: ["Intimate Wine Bars", "Rooftop Bars", "Lounge Cafes"],
        adjectives: ["Chill", "Soulful"]
    }, 
    "Alternative Rock": {
        settings: ["Dive Bars with Live Music", "Indie Coffeehouses", "Record Store Cafes"],
        adjectives: ["Independent", "Grunge"]
    },
    "Alternative Roots Rock": {
        settings: ["Brewpubs", "Wood-fired Pizza", "Barn Eateries"],
        adjectives: ["Modern", "Raw Energy"]
    },
    "Ambeat": {
        settings: ["Speakeasies", "Jazz Lounges", "Ramen Shops"],
        adjectives: ["Ambient", "Chill"]
    },
    "Ambient": {
        settings: ["Farm-to-table Restaurants", "Vegan Cafes", "Garden Cafes"],
        adjectives: ["Atmospheric", "Minimalist"]
    },
    "Ambient Dub Techno": {
        settings: ["Rooftop Bars", "Sushi bars", "Communal Dining Spaces"],
        adjectives: ["Meditative", "Slow"]
    },
    "Ambient Fusion": {
        settings: ["Brunch Spots", "Wine Cellars", "Fusion Restaurants"],
        adjectives: ["Ethereal", "Subtle"]
    },
    "Ambient Idm": {
        settings: ["Minimalist Cafes", "Omakase Counters", "Intimate Chef's Table"],
        adjectives: ["Lush", "Minimalist"]
    },
    "Ambient Psychill": {
        settings: ["Bohemian-style Cafes", "Hookah Lounges", "Vegetarian Restaurant"],
        adjectives: ["Dreamy", "Psychedelic"]
    },
    "Ambient Trance": {
        settings: ["Zen Tea House", "Ghost Kitchen", "Hookah Lounge"],
        adjectives: ["Dreamy", "Hypnotic"]
    },
    "Anarcho-punk": {
        settings: ["Food Trucks", "Indie-Grunge Cafes", "Dive Bars"],
        adjectives: ["Anarchist", "DIY"]
    },
    "Andean": {
        settings: ["Family-Style Restaurants", "Roastery Cafes", "Mountain Lodge Restaurants"],
        adjectives: ["South American", "Traditional"]
    },
    "Anime": {
        settings: ["Night Markets", "Video Game Bar", "Sushi Bar"],
        adjectives: ["Vibrant", "Japanese"]
    },
    "Anime Score": {
        settings: ["Izakaya", "Silent Cafe", "Art Cafe"],
        adjectives: ["Atmospheric", "Ethereal"]
    },
    "Anti-folk": {
        settings: ["Diner", "Third-Wave Coffee Shop", "Hawker Center"],
        adjectives: ["Personality", "Unconventional"]
    },
    "Antiviral Pop": {
        settings: ["Board Game Cafe", "Street Food", "Medieval Banquet"],
        adjectives: ["Experimental", "Upbeat"]
    },
    "Appalachian Folk": {
        settings: ["Beachside Shack", "Treehouse Restaurant", "Urban Industrial Loft Eatery"],
        adjectives: ["Old-timey", "Nature"]
    },
    "Arab Folk": {
        settings: ["Buffet", "Gastropub", "Communal Dining"],
        adjectives: ["Vibrant", "Traditional"]
    },
    "Arab Pop": {
        settings: ["Shisha Lounge", "Courtyard Cage", "Intimate Courtyard Cafe"],
        adjectives: ["Melancholic", "Addictive"]
    },
    "Arabesk": {
        settings: ["Upscale Mezze Restaurant", "Elegant Courtyard Restaurant", "Terrace Lounge"],
        adjectives: ["Diverse", "Desirable"]
    },
    "Argentine Indie": {
        settings: ["Tapas Bar", "Urban Bistro", "Open Kitchen Restaurant"],
        adjectives: ["Innovative", "Modern"]
    },
    "Argentine Reggae": {
        settings: ["Beachfront grill", "Bohemian Juice Bar", "Backyard-style Eatery"],
        adjectives: ["Vibrant", "Relaxed"]
    },
    "Argentine Rock": {
        settings: ["Rock Bar", "Indie Music Cafe", "Fusion Restaurant"],
        adjectives: ["Vibrant", "Eclectic"]
    },
    "Armenian Folk": {
        settings: ["Armenian Tavern", "Mezze Restaurant", "Wine Cellar"],
        adjectives: ["Lively", "Nostalgic"]
    },
    "Art Rock": {
        settings: ["Art Gallery Cafe", "Vinyl Cafe", "Pop-up Restaurant"],
        adjectives: ["Experiemental", "Avant-garde"]
    },
    "Athens Indie": {
        settings: ["Indie Cafe", "DIY Sandwich Shops", "Patio Pizza Spots"],
        adjectives: ["Community", "Alt"]
    },
    "Atmospheric Black Metal": {
        settings: ["Warehouse Breweries", "Late-night Food Stalls", "No-frills Burger Joints"],
        adjectives: ["Unconventional", "Grunge"]
    },
    "Atmospheric Post Rock": {
        settings: ["Vinyl Listening Bars", "Slow Dining Restaurants", "Vegan Kitchens"],
        adjectives: ["Experimental", "Slow-paced"]
    },
    "Atmospheric Post-metal": {
        settings: ["Industrial Breweries", "BBQ Joints", "Smokehouses"],
        adjectives: ["Immersive", "Intense"]
    },
    "Aussietronica": {
        settings: ["Beachfront Cafes", "Pop-up Kitchens", "Night Food Markets"],
        adjectives: ["Laid-back", "Natural"]
    },
    "Austindie": {
        settings: ["Roastery Cafe", "Food Trucks", "Beachside Shack"],
        adjectives: ["Introspective", "Eclectic"]
    },
    "Australian Alternative Rock": {
        settings: ["Urban Industrial Loft Eatery", "Test Kitchen", "Zero-waste Eatery"],
        adjectives: ["Eclectic", "Experimental"]
    },
    "Australian Country": {
        settings: ["Casual Dining Restaurant", "Whiskey Bar", "BBQ House"],
        adjectives: ["Laid-Back", "Traditional"]
    },
    "Australian Dance": {
        settings: ["Organic Eatery", "Karaoke Bar", "Casual Dining Restaurant"],
        adjectives: ["Energetic", "Diverse"]
    },
    "Australian Hip Hop": {
        settings: ["Fast Casual Restaurant", "Espresso Bar", "Rooftop Restaurant"],
        adjectives: ["Authentic", "Intricate"]
    },
    "Australian Indie": {
        settings: ["Beachfront restaurant", "Treehouse restaurant", "Dive bar"],
        adjectives: ["Creative", "Sun-soaked"]
    },
    "Australian Pop": {
        settings: ["Burger joint", "Open-air Food Market", "Zero-waste Eatery"],
        adjectives: ["Upbeat", "Friendly"]
    },
    "Austrian Hip Hop": {
        settings: ["Jungle Safari Restaurant", "Urban Industrial Loft Eatery", "Espresso Bar"],
        adjectives: ["Upbeat", "Dynamic"]
    },
    "Austropop": {
        settings: ["Viennese Coffee House", "Wine Bar", "Lakefront Restaurant"],
        adjectives: ["Simple", "Catchy"]
    },
    "Avant-garde": {
        settings: ["Courtyard Garden Restaurant", "Chef's Table", "Open Kitchen Experience"],
        adjectives: ["Innovative", "Aesthetic"]
    },
    "Avant-garde Jazz": {
        settings: ["Art Gallery Cafe", "Cave Dining Experience", "Jazz Bar"],
        adjectives: ["Experimental", "Unconventional"]
    },
    "Avant-Garde Metal": {
        settings: ["Fusion Kitchens", "Speakeasies", "Industrial-themed Breweries"],
        adjectives: ["Unconventional", "Progressive"]
    },
    "Axe": {
        settings: ["Beachfront Bars", "Street Food Markets", "Churrascarias"],
        adjectives: ["Good vibrations", "Vibrant"]
    },
    "Azonto": {
        settings: ["BBQ Joints", "Dance Lounge Restaurants", "Night Market Eateries"],
        adjectives: ["Intricate", "Energetic"]
    }
}

module.export = genreMappings