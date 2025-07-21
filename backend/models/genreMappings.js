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
    },
    "Bachata": {
        settings: ["Dessert Lounges", "Tapas Bars", "Artisan Bakeries"],
        adjectives: ["Bittersweet", "Sensual"]
    },
    "Baile Funk": {
        settings: ["Food Trucks", "Open-air Joints", "Restaurant Bars"],
        adjectives: ["Powerful", "High-energy"]
    },
    "Balearic": {
        settings: ["Beach Cafes", "Outdoor Patios", "Mediterranean Cafes"],
        adjectives: ["Relaxed", "Vibrant"]
    },
    "Balkan Brass": {
        settings: ["Taverns", "Balkan Restaurants", "Beer Gardens"],
        adjectives: ["High-energy", "Fast"]
    },
    "Banda": {
        settings: ["Taquerias", "Open-air Plazas", "Cantinas"],
        adjectives: ["Upbeat", "Celebrational"]
    },
    "Bangla": {
        settings: ["Quiet Cafes", "Bengali Eateries", "Sweet Shops"],
        adjectives: ["Romantic", "Dynamic"]
    },
    "Barbershop": {
        settings: ["Retro Diners", "Ice cream Parlors", "Americana-style Cafes"],
        adjectives: ["Harmonious", "Community"]
    },
    "Barnemusikk": {
        settings: ["Kid-friendly Cafes", "Themed Restaurants", "Pancake Houses"],
        adjectives: ["Cheerful", "Entertaining"]
    },
    "Barnmusik": {
        settings: ["Kid-friendly Cafes", "Themed Restaurants", "Pancake Houses"],
        adjectives: ["Cheerful", "Entertaining"]
    },
    "Baroque": {
        settings: ["Fine Dining", "European Tea Rooms", "Historic Mansion Cafes"],
        adjectives: ["Ornate", "Dramatic"]
    },
    "Baroque Ensemble": {
        settings: ["Opera House", "Museum Cafes", "European Fine Dining"],
        adjectives: ["Ornate", "Complex"]
    },
    "Basque Rock": {
        settings: ["Taverns", "Late-night Pizza Joints", "Food Trucks"],
        adjectives: ["Punk", "Rebellious"]
    },
    "Bass House": {
        settings: ["Late-night Street Food", "Urban fast-casual", "Cocktail Lounges"],
        adjectives: ["Groovy", "Explosive"]
    },
    "Bass Music": {
        settings: ["Urban Fusion Restaurants", "Speakeasies", "Underground Burger Joints"],
        adjectives: ["Dark", "Heavy"]
    },
    "Bass Trip": {
        settings: ["Fusion Lounge", "Underground Tasting Room", "Multi-course Meal"],
        adjectives: ["Hypnotic", "Immersive"]
    },
    "Bassline": {
        settings: ["Urban Cafes", "Street Food Courts", "Pop-up Kitchens"],
        adjectives: ["Energetic", "Friendly"]
    },
    "Bay Area Hip Hop": {
        settings: ["Community-owned Eateries", "Underground pop-ups", "Rotating Menu Concepts"],
        adjectives: ["Innovative", "Socially Conscious"]
    }, 
    "Beach Music": {
        settings: ["Seaside Shacks", "Tropical-themed restaurants", "Tiki Bars"],
        adjectives: ["Upbeat", "Party"]
    },
    "Beatdown": {
        settings: ["Tattoo-parlor Takeout", "BBQ Joints", "All-vegan Punk Cafe"],
        adjectives: ["Hardcore", "Punk"]
    },
    "Beats & Rhymes": {
        settings: ["Hip-hop Cafes", "Juice Bars", "Experimental Kitchens"],
        adjectives: ["Funky", "Unique"]
    },
    "Bebop": {
        settings: ["Jazz Lounges", "Speakeasy Bars", "Upscale Bistros"],
        adjectives: ["Complex", "Fast"]
    },
    "Belgian Indie": {
        settings: ["Indie Bakeries", "Family-owned Restaurants", "Collaborative Cafe"],
        adjectives: ["Independent Spirit", "Innovative"]
    },
    "Belgian Rock": {
        settings: ["Neighborhood Pubs", "Food Markets", "Small Batch Breweries"],
        adjectives: ["Diversity", "Local"]
    },
    "Belly Dance": {
        settings: ["Middle Eastern Restaurants", "Rustic Cafes", "Family-style eateries"],
        adjectives: ["Traditional", "Contemporary"]
    },
    "Belorush": {
        settings: ["Cozy Taverns", "Traditional Bakeries", "Urban Spots"],
        adjectives: ["Blend", "Modern"]
    },
    "Bemani": {
        settings: ["Arcade-themed Cafes", "Retro-futuristic diners", "Quick Bites"],
        adjectives: ["Electronic", "Video Games"]
    },
    "Benga": {
        settings: ["Dance-friendly Bars", "African Outdoor Patios", "Shareable Plates"],
        adjectives: ["Vibrant", "Upbeat"]
    },
    "Bhangra": {
        settings: ["Punjabi Dhabas", "Cultural Food Markets", "Contemporary Restaurants"],
        adjectives: ["Pop", "Fusion"]
    },
    "Big Band": {
        settings: ["Classic American Diners", "Cocktail Lounges", "Supper Clubs"],
        adjectives: ["Graceful", "Joyous"]
    },
    "Big Beat": {
        settings: ["Urban Fusion Spots", "Party Brunches", "Clubs"],
        adjectives: ["High-energy", "Party-oriented"]
    },
    "Big Room": {
        settings: ["Open-air Rooftops", "Cocktail Bars", "Trendy Restaurants"],
        adjectives: ["Commercial", "High-energy"]
    },
    "Black Death": {
        settings: ["Dive Bars", "Food Trucks", "Industrial-styled Restaurants"],
        adjectives: ["Aggressive", "Chaotic"]
    },
    "Black Metal": {
        settings: ["Dimly lit Metal Bars", "Avant-garde Cafes", "Mom & Pop Restaurants"],
        adjectives: ["Distorted", "Unconventional"]
    },
    "Black Sludge": {
        settings: ["BBQ Joints", "Craft Beer Bars", "Urban Diners"],
        adjectives: ["Slow", "Heavy"]
    },
    "Black Thrash": {
        settings: ["Metal-themed Food Trucks", "Industrial Beer Halls", "Late-night Taco Spot"],
        adjectives: ["Aggressive", "Harsh"]
    },
    "Blackgaze": {
        settings: ["Minimalist Cafes", "Experimental Kitchens", "Tea Lounges"],
        adjectives: ["Dreamy", "Dark"]
    },
    "Blaskapelle": {
        settings: ["Beer Gardens", "Traditional Eateries", "Open-air Markets"],
        adjectives: ["Lively", "Social"]
    },
    "Bluegrass": {
        settings: ["Farm-to-table Southern Restaurants", "Countryside Diners", "Rustic-chic Cafes"],
        adjectives: ["Harmony", "Intricate"]
    },
    "Blues": {
        settings: ["Southen Soul-food", "Juke Joints", "Neighborhood Cafes"],
        adjectives: ["Resilient", "Soulful"]
    },
    "Blues-Rock": {
        settings: ["Live-music Restaurants", "Food Halls", "Fine-casual Restaurants"],
        adjectives: ["Electric", "Jazzy"]
    },
    "Blues-rock Guitar": {
        settings: ["Live-music Restaurants", "Food Halls", "Fine-casual Restaurants"],
        adjectives: ["Electric", "Jazzy"]
    },
    "Bmore": {
        settings: ["Neighborhood Joints", "Diners", "Family-friendly Spots"],
        adjectives: ["High-energy", "Easy-going"]
    },
    "Bolero": {
        settings: ["Tapas-style Wine Bars", "Candlelit Patios", "Dessert Cafes"],
        adjectives: ["Melodic", "Romantic"]
    },
    "Boogaloo": {
        settings: ["Latin Fusion Restaurants", "Salsa Bars", "Casual Eateries"],
        adjectives: ["Blend", "Soulful"]
    },
    "Boogie-woogie": {
        settings: ["Retro Diners", "Bars with Live Piano", "Outdoor Patio Restaurants"],
        adjectives: ["Energetic", "Improvised"]
    },
    "Bossa Nova": {
        settings: ["Wine Bars", "Brazilian Restaurants", "Beachfront Restaurant"],
        adjectives: ["Relaxed", "Sophisticated"]
    },
    "Bossa Nova Jazz": {
        settings: ["Jazz Lounge", "Wine Bars", "Garden Restaurants"],
        adjectives: ["Mellow", "Melodic"]
    },
    "Boston Rock": {
        settings: ["Classic American Grills", "Sports Bars", "Casual Joints"],
        adjectives: ["Energetic", "Addictive"]
    },
    "Bounce": {
        settings: ["Late-night Eateries", "Buffet-style", "Casual Neighborhood Joint"],
        adjectives: ["Party", "Energetic"]
    },
    "Bouncy House": {
        settings: ["Trendy Eateries", "Social Bars", "Pop-up Joints"],
        adjectives: ["Energetic", "Playful"]
    },
    "Bow Pop": {
        settings: ["Kawaii Cafes", "Asian-Fusion Spots", "Food Halls"],
        adjectives: ["Catchy", "Electronic"]
    },
    "Boy Band": {
        settings: ["Themed Cafes", "Instagrammable Restaurant", "Bakeries"],
        adjectives: ["Harmonious", "Infatuated"]
    },
    "Brass Band": {
        settings: ["Family-style Eateries", "Brunch Cafes", "Picnic-style Restaurants"],
        adjectives: ["Uplifting", "Communal"]
    },
    "Brass Ensemble": {
        settings: ["Family-style Eateries", "Brunch Cafes", "Picnic-style Restaurants"],
        adjectives: ["Uplifting", "Communal"]
    },
    "Brazilian Composition": {
        settings: ["Brazilian Restaurants", "Churrasco-style Dining", "Shared Dining Spaces"],
        adjectives: ["Diverse", "Vibrant"]
    },
    "Brazilian Gospel": {
        settings: ["Christian Cafes", "Brunch Spots", "Family-style Restaurants"],
        adjectives: ["Vibrant", "Soulful"]
    },
    "Brazilian Hip Hop": {
        settings: ["Brazilian Fusion Restaurants", "Open Mic Cafes", "Dance Bars"],
        adjectives: ["Socially Conscious", "Party-oriented"]
    },
    "Brazilian Indie": {
        settings: ["Intimate Cafes", "Rooftop Restaurants", "Chef-curated Menus"],
        adjectives: ["Romantic", "Melodic"]
    },
    "Brazilian Pop Music": {
        settings: ["Brazilian Cafes", "Lively Fusion Spots", "Open-air Patios"],
        adjectives: ["Vibrant", "Rooted"]
    },
    "Brazilian Punk": {
        settings: ["Late-night Snack Bars", "Local Bars", "Concept Eateries"],
        adjectives: ["Raw", "Unique"]
    },
    "Breakbeat": {
        settings: ["Trendy Eateries", "Small Joints", "Experimental Cafes"],
        adjectives: ["Processed", "Unique"]
    },
    "Breakcore": {
        settings: ["Underground Eateries", "Art Cafes", "Invite-only Food Nights"],
        adjectives: ["Complex", "Experimental"]
    },
    "Breaks": {
        settings: ["Urban DJ Cafes", "Food Trucks", "Cult Favorite Restaurants"],
        adjectives: ["Broken", "Influential"]
    },
    "Brega": {
        settings: ["Cozy Cafes", "Juice Bars", "Dessert Bars"],
        adjectives: ["Upbeat", "Romantic"]
    },
    "Breton Folk": {
        settings: ["Heritage Restaurants", "Regional Eateries", "Folk Cafes"],
        adjectives: ["Lively", "Traditional"]
    },
    "Brill Building Pop": {
        settings: ["Retro-modern Cafes", "Art Cafes", "Bistros"],
        adjectives: ["Sophisticated", "Friendly"]
    },
    "British Alternative Rock": {
        settings: ["Indie Cafes", "Music Restaurants", "Seasonal Menus"],
        adjectives: ["Introspective", "Distinct"]
    },
    "British Blues": {
        settings: ["Modern Pubs", "Vinyl Cafes", "Gastropubs"],
        adjectives: ["Powerful", "Innovative"]
    },
    "British Brass Band": {
        settings: ["Tearooms", "Seasonal Menus", "Minimalist Cafe"],
        adjectives: ["Dynamic", "Mellow"]
    },
    "British Dance Band": {
        settings: ["Art Deco Cocktail Bar", "Vintage Tea Rooms", "Upscale Restaurants"],
        adjectives: ["Smooth", "Jazzy"]
    },
    "British Folk": {
        settings: ["Countryside Cafes", "Farm-to-table Restaurants", "Sunday Roast Eateries"],
        adjectives: ["Traditional", "Rooted"]
    },
    "British Indie Rock": {
        settings: ["Record Store Cafes", "Pop-up Food Stalls", "Natural Wine Bar"],
        adjectives: ["Independent", "Introspective"]
    },
    "British Invasion": {
        settings: ["Rock-inspired Restaurants", "British Restaurants", "Retro-futurist Diner"],
        adjectives: ["Youthful", "Experimental"]
    },
    "Britpop": {
        settings: ["British-themed Diners", "Food Stalls", "Old-school Restaurants"],
        adjectives: ["Upbeat", "Nostalgic"]
    },
    "Broadway": {
        settings: ["Musical Restaurants", "Bright Bakeries", "Themed Cafes"],
        adjectives: ["Dynamic", "Uplifting"]
    },
    "Broken Beat": {
        settings: ["Trendy Urban Eateries", "Experimental Kitchens", "Minimalist Cafes"],
        adjectives: ["Abstract", "Bold"]
    },
    "Brooklyn Indie": {
        settings: ["Coffee Shops", "Small Plates Eateries", "Food Markets"],
        adjectives: ["Introspective", "Eclectic"]
    },
    "Brostep": {
        settings: ["Late-night Food Trucks", "Club Restaurants", "Rustic Eateries"],
        adjectives: ["Intense", "Distorted"]
    },
    "Brutal Death Metal": {
        settings: ["Metal-themed Food Joints", "Dive Bars", "BBQ Counters"],
        adjectives: ["Extreme", "Speedy"]
    },
    "Brutal Deathcore": {
        settings: ["Metal-themed Food Joints", "Dive Bars", "BBQ Counters"],
        adjectives: ["Extreme", "Speedy"]
    },
    "Bubble Trance": {
        settings: ["Futuristic Cafes", "Bakeries", "Fusion Restaurants"],
        adjectives: ["Upbeat", "Progressive"]
    },
    "Bubblegum Dance": {
        settings: ["Dessert Cafes", "Instagrammable Restaurants", "Interactive Food Spots"],
        adjectives: ["Upbeat", "Playful"]
    },
    "Bubblegum Pop": {
        settings: ["Neon Diners", "Dessert Cafes", "Food Courts"], 
        adjectives: ["Youthful", "Simplistic"]
    },
    "Bulgarian Rock": {
        settings: ["Balkan Restaurants", "Global Bistros", "Urban Eateries"],
        adjectives: ["Eclectic", "Energetic"]
    },
    "Byzantine": {
        settings: ["Monastic-style Dining", "Quiet Tea Rooms", "Ceremonial Restaurants"],
        adjectives: ["Religious", "Traditional"]
    },
    "C-pop": {
        settings: ["Pan-Asian Bistro", "Upscale Cafes", "Tea Lounges"],
        adjectives: ["Diverse", "Polished"]
    },
    "C64": {
        settings: ["Retro Arcade Cafe", "Themed Diners", "High-tech Restaurants"],
        adjectives: ["Unique", "Electronic"]
    },
    "C86": {
        settings: ["Indie Coffee Shop", "Vegetarian Restaurant", "Independent Diners"],
        adjectives: ["Jangly", "DIY"]
    },
    "Cabaret": {
        settings: ["Burlesque-style Lounges", "Vintage Cocktail Bars", "Supper Clubs"],
        adjectives: ["Playful", "Theatrical"]
    },
    "Cajun": {
        settings: ["Cajun Kitchens", "Family-style Spots", "Restaurant with Live Music"],
        adjectives: ["Lively", "Distinct"]
    },
    "Calypso": {
        settings: ["Beachside Food Shacks", "Food Pop-ups", "Food Trucks"],
        adjectives: ["Witty", "Upbeat"]
    },
    "Canadian Country": {
        settings: ["Mountain Lodge Restaurant", "Family-run Diners", "Farm-to-table Spots"],
        adjectives: ["Rustic", "Folk"]
    },
    "Canadian Hip Hop": {
        settings: ["Urban Cafes", "Multicultural Food Courts", "Street Food"],
        adjectives: ["Authentic", "Diverse"]
    },
    "Canadian Indie": {
        settings: ["Vinyl Coffee Shop", "Neighborhood Bistros", "Candlelit Restaurant"],
        adjectives: ["Eclectic", "Atmospheric"]
    },
    "Canadian Metal": {
        settings: ["Underground Bars", "Food Trucks", "Vegan Punk Cafes"],
        adjectives: ["Experimental", "Punk"]
    },
    "Canadian Pop": {
        settings: ["Instagrammable Cafes", "Fast-casual Chains", "Dessert Bars"],
        adjectives: ["Catchy", "Accesible"]
    },
    "Candy Pop": {
        settings: ["Dessert Cafes", "Family-friendly Restaurants", "Juice Bars"],
        adjectives: ["Cheerful", "Bright"]
    },
    "Cantautor": {
        settings: ["European Restaurants", "Intimate Cafes", "Tapas Bars"],
        adjectives: ["Poetic", "Introspective"]
    },
    "Cante Flamenco": {
        settings: ["Spanish Taverns", "Flamenco Tablaos", "Candlelit Restaurants"],
        adjectives: ["Deep", "Unique"]
    },
    "Canterbury Scene": {
        settings: ["European Bistro", "Garden Cafes", "Themed Cafes"],
        adjectives: ["Quirky", "Whimsical"]
    },
    "Cantopop": {
        settings: ["Hong Kong Cafes", "Tea Houses", "Trendy Brunch Spots"],
        adjectives: ["Catchy, Complex"]
    },
    "Canzone Napoletana": {
        settings: ["Family-run Trattorias", "Nonna-style Restaurants", "Coastal Cafes"],
        adjectives: ["Traditional", "Expressive"]
    },
    "Capoeira": {
        settings: ["Afro-Brazilian Cafes", "Open-air Street Food", "Tapas-style Dining"],
        adjectives: ["Rhythmic", "Energetic"]
    },
    "Carnatic": {
        settings: ["South Indian Vegetarian Spots", "Family-run Kitchens", "Thali-style"],
        adjectives: ["Intricate", "Devotional"]
    }, 
    "Catstep": {
        settings: ["Ramen Bars", "Food Trucks", "Late-night Restaurants"],
        adjectives: ["Loud", "Heavy"]
    },
    "Caucasian Folk": {
        settings: ["Open-fire Grills", "Communal Tables", "Old-world Kitchens"],
        adjectives: ["Traditional", "Diverse"]
    },
    "Ccm": {
        settings: ["Christian Cafe", "Community-focused Diners", "Bakeries"],
        adjectives: ["Faithful", "Uplifting"]
    },
    "Ceilidh": {
        settings: ["Traditional Pubs", "Outdoor Beer Gardens", "Family-style Eateries"],
        adjectives: ["Lively", "Communal"]
    },
    "Cello": {
        settings: ["Intimate Bistros", "Slow Dining", "Fireside Dining Rooms"],
        adjectives: ["Deep", "Warm"]
    },
    "Celtic": {
        settings: ["Rustic Pubs", "Festival Restaurants", "Celtic Eateries"],
        adjectives: ["Lively", "Melancholic"]
    },
    "Celtic Christmas": {
        settings: ["Rustic Inns", "Family-style Dinners", "Holiday Markets"],
        adjectives: ["Festive", "Melancholic"]
    },
    "Celtic Punk": {
        settings: ["Dive Bars", "Colorful Cafes", "Celtic Bars"],
        adjectives: ["Energetic", "Rebellious"]
    },
    "Celtic Rock": {
        settings: ["Music Venue Pubs", "Cozy Cafes", "Folk Restaurants"],
        adjectives: ["Folk", "Energetic"]
    },
    "Central Asian Folk": {
        settings: ["Family-run Eateries", "Nomadic Heritage Eateries", "Traditional Central Asian Restaurant"],
        adjectives: ["Intricate", "Melodic"]
    },
    "Chalga": {
        settings: ["Late-night Lounges", "Live Music Restaurants", "Finger Foods"],
        adjectives: ["Energetic", "Fast"]
    },
    "Chamber Pop": {
        settings: ["Upscale Bistros", "Art Cafes", "Botanical Restaurants"],
        adjectives: ["Lush", "Intricate"]
    },
    "Chanson": {
        settings: ["French Cafes", "Intimate Dining Rooms", "Vintage Restaurants"],
        adjectives: ["Emotional", "Intimate"]
    },
    "Chanson Quebecois": {
        settings: ["Rustic Quebecois Bistros", "Farm-to-table Eateries", "Seasonal Menus"],
        adjectives: ["Nature", "Poetic"]
    },
    "Chaotic Black Metal": {
        settings: ["Industrial Eateries", "Avant-garde Restaurants", "Dense Menu Spots"],
        adjectives: ["Dissonant", "Overwhelming"]
    },
    "Chaotic Hardcore": {
        settings: ["Underground Punk Dives", "No-frills Food Joints", "Grab-and-go"],
        adjectives: ["Fast", "Unpredictable"]
    },
    "Charred Death": {
        settings: ["Blackened Grill", "Industrial Restaurants", "Metal-inspired Kitchens"],
        adjectives: ["Destructive", "Chaotic"]
    },
    "Chicago Blues": {
        settings: ["BBQ Joints", "Blues Bars", "Comfort Food"],
        adjectives: ["Amplified", "Expressive"]
    },
    "Chicago House": {
        settings:["Supper Clubs", "Comfort Menus", "Cocktail Dining Room"],
        adjectives: ["Soulful", "Hypnotic"]
    },
    "Chicago Indie": {
        settings: ["Indie Cafes", "Artsy Food Spots", "Neighborhood Cafes"],
        adjectives: ["Eclectic", "DIY"]
    }
}

module.export = genreMappings