/* =========================================================
   LOAD ENVIRONMENT VARIABLES
   ========================================================= */

import "dotenv/config";


/* =========================================================
   IMPORTS
   ========================================================= */

import express from "express";
import cors from "cors";
import path from "node:path";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { rateLimit } from "express-rate-limit";

import {
    getGoogleAuthURL,
    handleGoogleCallback,
    createCalendarEvent,
    getAvailableTimes
} from "./calendar.js";


/* =========================================================
   SERVER SETUP
   ========================================================= */

const app = express();
let authAttempt = null;
const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
app.disable("x-powered-by");
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));

// Serve only public website files. Never expose server code or credentials.
app.use((req, res, next) => {
    const publicPath = req.path === "/" ? "/index.html" : req.path;
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (!/^\/(?:[a-zA-Z0-9_-]+\.(?:html|css|js)|assets\/[a-zA-Z0-9_./-]+)$/.test(publicPath) || publicPath.includes("..")) return next();
    res.sendFile(path.join(siteRoot, publicPath), { dotfiles: "deny" }, error => { if (error) next(); });
});
app.get("/health", (req, res) => res.json({ success: true }));

const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
console.log("ENV CHECK:");
console.log(
    "Client ID:",
    process.env.GOOGLE_CLIENT_ID ? "LOADED" : "MISSING"
);
console.log(
    "Client Secret:",
    process.env.GOOGLE_CLIENT_SECRET ? "LOADED" : "MISSING"
);
console.log(
    "Redirect URI:",
    process.env.GOOGLE_REDIRECT_URI ? "LOADED" : "MISSING"
);
console.log(
    "Refresh Token:",
    process.env.GOOGLE_REFRESH_TOKEN ? "LOADED" : "MISSING"
);


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(express.json({ limit: "10kb" }));

const allowedOrigins = [
    "https://tnaxisai.com",
    "https://www.tnaxisai.com"
];

if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push(
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    );
}

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
/* =========================================================
   BOOKING API RATE LIMITING
   ========================================================= */

const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many booking attempts. Please try again in 15 minutes."
    }
});

const availabilityLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many availability requests. Please try again shortly."
    }
});

/* =========================================================
   TEST ROUTE
   ========================================================= */

app.get("/", (req, res) => {
    if (IS_PRODUCTION) {
        return res.sendStatus(404);
    }

    res.json({
        message: "TNaxis backend is running."
    });

});


/* =========================================================
   START GOOGLE AUTH
   ========================================================= */

app.get("/auth/google", (req, res) => {

    if (IS_PRODUCTION) return res.sendStatus(404);
    const state = randomBytes(32).toString("hex");
    authAttempt = { state, expires: Date.now() + 10 * 60 * 1000 };
    res.cookie("tnaxis_calendar_state", state, { httpOnly: true, sameSite: "lax", maxAge: 600000, path: "/auth/google" });
    const authURL = getGoogleAuthURL(state);

    res.redirect(authURL);

});


/* =========================================================
   GOOGLE CALLBACK
   ========================================================= */

app.get(
    "/auth/google/callback",
    async (req, res) => {
        if (IS_PRODUCTION) {
            return res.sendStatus(404);
        }

        try {

            const state = req.query.state;
            const cookie = req.headers.cookie?.split("; ").find(value => value.startsWith("tnaxis_calendar_state="))?.split("=")[1];
            if (!authAttempt || Date.now() > authAttempt.expires || typeof state !== "string" || state !== cookie || state.length !== authAttempt.state.length || !timingSafeEqual(Buffer.from(state), Buffer.from(authAttempt.state))) {
                return res.status(400).send("Please restart calendar connection at /auth/google.");
            }
            authAttempt = null;
            res.clearCookie("tnaxis_calendar_state", { path: "/auth/google" });
            const code = req.query.code;

            if (!code) {

                return res
                    .status(400)
                    .send(
                        "No authorization code was received from Google."
                    );

            }


            const tokens =
                await handleGoogleCallback(code);

            if (!tokens.refresh_token) throw new Error("No refresh token received.");
            const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env");
            const envText = await readFile(envPath, "utf8");
            const tokenLine = `GOOGLE_REFRESH_TOKEN=${JSON.stringify(tokens.refresh_token)}`;
            const updatedEnv = /^\s*GOOGLE_REFRESH_TOKEN\s*=.*$/m.test(envText)
                ? envText.replace(/^\s*GOOGLE_REFRESH_TOKEN\s*=.*$/m, () => tokenLine)
                : `${envText}\n${tokenLine}\n`;
            await writeFile(envPath, updatedEnv, { mode: 0o600 });
            process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;


            console.log(
                "Google Calendar connected successfully."
            );

            console.log(
                "Refresh token received:",
                Boolean(tokens.refresh_token)
            );


            res.send(`
                <!DOCTYPE html>

                <html>

                <head>
                    <title>TNaxis Calendar Connected</title>
                </head>

                <body
                    style="
                        margin:0;
                        min-height:100vh;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#0A0810;
                        color:#F4F6F9;
                        font-family:Arial,sans-serif;
                    "
                >

                    <div style="text-align:center;">

                        <h1>
                            TNaxis Calendar Connected
                        </h1>

                        <p>
                            Google Calendar authorization
                            was successful.
                        </p>

                        <p>
                            You can close this tab.
                        </p>

                    </div>

                </body>

                </html>
            `);

        }

        catch (error) {

            console.error(
                "Google authentication error:",
                error
            );

            res
                .status(500)
                .send(
                    "Google Calendar authentication failed."
                );

        }

    }
);

/* =========================================================
   TEST CALENDAR EVENT
   ========================================================= */

app.get(
    "/test-calendar",
    async (req, res) => {
        if (IS_PRODUCTION) {
            return res.sendStatus(404);
        }
        try {

            const event =
                await createCalendarEvent();


            console.log(
                "Calendar event created:",
                event.summary
            );


            res.json({

                success: true,

                message:
                    "TNaxis test appointment created.",

                eventId:
                    event.id,

                eventLink:
                    event.htmlLink

            });

        }

        catch (error) {

            console.error(
                "Calendar event error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Could not create calendar event."

            });

        }

    }
);

/* =========================================================
   GET AVAILABLE APPOINTMENTS
   ========================================================= */

app.get(
    "/api/availability",
    availabilityLimiter,
    async (req, res) => {

        try {

            const date =
                req.query.date;


            // Require YYYY-MM-DD
            if (
                !date ||
                !/^\d{4}-\d{2}-\d{2}$/.test(date)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "A valid date is required."

                });

            }


            const availableTimes =
                await getAvailableTimes(date);


            res.json({

                success: true,

                date:
                    date,

                availableTimes:
                    availableTimes

            });

        }

        catch (error) {

            console.error(
                "Availability error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Could not retrieve availability."

            });

        }

    }
);
/* =========================================================
   BOOK DEMO APPOINTMENT
   ========================================================= */

app.post(
    "/api/book",
    bookingLimiter,
    async (req, res) => {

        try {

            const {
                name,
                business,
                email,
                phone,
                businessType,
                website,
                date,
                time
            } = req.body;


            /* ---------------------------------------------
               VALIDATE REQUIRED FIELDS
               --------------------------------------------- */

            if (
                !name ||
                !business ||
                !email ||
                !date ||
                !time
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please complete all required fields."

                });

            }


            /* ---------------------------------------------
               CREATE CALENDAR EVENT

               createCalendarEvent() checks availability
               again immediately before creating the event.
               --------------------------------------------- */

            const event =
                await createCalendarEvent({

                    name,
                    business,
                    email,
                    phone,
                    businessType,
                    website,
                    date,
                    time

                });


            /* ---------------------------------------------
               SUCCESS
               --------------------------------------------- */

            res.status(201).json({

                success: true,

                message:
                    "Your TNaxis demo has been scheduled.",

                eventId:
                    event.id,

                eventLink:
                    event.htmlLink

            });

        }

        catch (error) {


            /* ---------------------------------------------
               SLOT WAS JUST TAKEN
               --------------------------------------------- */

            if (
                error.message ===
                "That appointment time is no longer available."
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "That time was just taken. Please choose another time."

                });

            }


            /* ---------------------------------------------
               OTHER ERROR
               --------------------------------------------- */

            res.status(500).json({

                success: false,

                message:
                    "Could not schedule your demo."

            });

        }

    }
);
/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {

    console.log(
        `TNaxis backend running at http://localhost:${PORT}`
    );

    console.log(
        `Connect Google Calendar at http://localhost:${PORT}/auth/google`
    );

});