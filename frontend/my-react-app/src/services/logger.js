const API = import.meta.env.VITE_API_URL

const send = (level, action, error, context = {}) => {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    const userId = localStorage.getItem("spotify_access_token") ? "authenticated" : "unauthenticated"

    // Fire-and-forget — never blocks the caller
    fetch(`${API}/api/log-error`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, action, message, stack, context, userId }),
    }).catch(() => {}) // silently swallow if logging itself fails
}

const logger = {
    error: (action, error, context) => {
        console.error(`[${action}]`, error)
        send("error", action, error, context)
    },
    warn: (action, error, context) => {
        console.warn(`[${action}]`, error)
        send("warn", action, error, context)
    },
    info: (action, message, context) => {
        send("info", action, message, context)
    },
}

export default logger
