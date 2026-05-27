exports.getIpLocation = async (req, res) => {
  try {
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) {
      console.error("IP location API returned status:", response.status)
      return res.status(502).json({ error: "Failed to fetch IP location from external service" })
    }
    const data = await response.json()
    if (!data.latitude || !data.longitude) {
      return res.status(502).json({ error: "IP location response missing coordinates" })
    }
    res.json(data)
  } catch (error) {
    console.error("Error fetching IP location:", error)
    res.status(500).json({ error: "Failed to fetch IP location" })
  }
}
