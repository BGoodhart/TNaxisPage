/* =========================================================
   LOAD ENVIRONMENT VARIABLES
   ========================================================= */

import "dotenv/config";


/* =========================================================
   IMPORTS
   ========================================================= */

import express from "express";
import cors from "cors";

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

const PORT = process.env.PORT || 3000;
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

app.use(express.json());
app.use(cors());


/* =========================================================
   TEST ROUTE
   ========================================================= */

app.get("/", (req, res) => {

    res.json({
        message: "TNaxis backend is running."
    });

});


/* =========================================================
   START GOOGLE AUTH
   ========================================================= */

app.get("/auth/google", (req, res) => {

    const authURL = getGoogleAuthURL();

    res.redirect(authURL);

});


/* =========================================================
   GOOGLE CALLBACK
   ========================================================= */

app.get(
    "/auth/google/callback",
    async (req, res) => {

        try {

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

            console.error(
                "Booking error:",
                error
            );


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