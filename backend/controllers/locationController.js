exports.getIpLocation = async (req, res) => {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error("Error fetching IP location:", error)
    res.status(500).json({ error: "Failed to fetch IP location" })
  }
}
