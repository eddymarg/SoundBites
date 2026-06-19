# 🎵 SoundBites

> **What if your music taste could tell you where to eat?**

SoundBites is a full-stack web application that connects to your Spotify account, analyzes your top music genres, and recommends nearby restaurants that match the vibe of what you've been listening to. Because "Top 10 Spots" on TikTok has never once known what you actually wanted.

---

## 📸 Demo

[![Watch the video][(https://youtube.com)](https://youtu.be/EImfk59yW0Y)]


---

## How It Works

1. **Connect your Spotify account** — SoundBites uses Spotify OAuth to securely access your listening data. No passwords stored, ever.
2. **Get your top genres** — The app pulls your top 10 music genres from the Spotify Web API and identifies your listening personality.
3. **Genre meets cuisine** — A custom genre-to-cuisine mapping logic cross-references your music taste with nearby restaurant categories.
4. **See your recommendations** — Every result includes the restaurant name, address, rating, hours, phone number, website, and a direct map link.
5. **Save your favorites** — Found somewhere you love? Save it to your profile for next time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | Spotify OAuth 2.0 |
| APIs | Spotify Web API, Google Maps API, Google Places API |
| Styling | CSS Modules |
| Version Control | Git, GitHub |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A Spotify Developer account — [create one here](https://developer.spotify.com/dashboard)
- A Google Cloud account with Maps and Places APIs enabled — [get started here](https://console.cloud.google.com/)
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/eddymarg/soundbites.git
cd soundbites
```

2. **Install dependencies for both frontend and backend**

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `/server` directory with the following:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

> ⚠️ Never commit your `.env` file. It is included in `.gitignore` by default.

4. **Run the application**

```bash
# Start the backend server
cd server
npm run dev

# In a separate terminal, start the frontend
cd client
npm run dev
```

5. **Open your browser and navigate to** `http://localhost:5173`

---

## Project Documentation

This project includes a full **Software Requirements Specification (SRS)** documenting the functional requirements, non-functional requirements, system constraints, and acceptance criteria for each feature.

📄 [View the SRS here](https://docs.google.com/document/d/1lr8w-XrFKAbHOS3SHpjrKUAeo0E0bBcb7bqjbOQZLi8/edit?usp=sharing)

Writing the SRS was intentional — I wanted to practice the full project lifecycle beyond just writing code, including requirements definition, scope documentation, and traceability. It is available as a portfolio artifact for anyone evaluating the analytical side of this project.

---

## Known Limitations

- **Spotify API rate limits:** SoundBites is currently in Spotify's development mode, which limits access to 25 approved users at a time. If you'd like to test the app and can't log in, reach out and I'll add you to the allowlist.
- **Restaurant data accuracy:** Restaurant information is sourced from the Google Places API and reflects whatever Google currently has on file. Occasionally hours or ratings may be slightly outdated.
- **Genre-to-cuisine mapping:** The current mapping logic is rules-based. Niche or hybrid genres may produce unexpected but occasionally delightful results.

---

## What I Learned

Building SoundBites taught me a lot about what it actually takes to ship something end-to-end. A few things that stuck with me:

- **Perfectionism is the enemy of done.** There were weeks I wanted to scrap everything and start over. Shipping an imperfect version and iterating is always better than waiting for perfect.
- **User feedback catches what you can't.** Having friends beta test caught issues I'd become completely blind to after staring at the same screens every day.
- **Documentation matters as much as the code.** Writing the SRS forced me to think clearly about what the system needed to do before adding more features, which saved a lot of rework.

---

## Future Improvements

- [ ] User feedback on recommendations (thumbs up / down) to improve the genre-to-cuisine logic over time
- [ ] Expand beyond Spotify to support Apple Music
- [ ] Add a shareable recommendations link so users can send their results to friends
- [ ] Analytics dashboard showing listening trends over time

---

## Author

**Edrienne Gregana**
- Portfolio: [edriennegreganaportfolio.vercel.app](https://edriennegreganaportfolio.vercel.app)
- LinkedIn: [linkedin.com/in/edrienne-g](https://linkedin.com/in/edrienne-g)
- GitHub: [github.com/eddymarg](https://github.com/eddymarg)

---

*Built with curiosity, perseverance, and a lot of playlists.* 🎧
