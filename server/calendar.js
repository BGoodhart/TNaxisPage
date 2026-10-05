import "dotenv/config";
import { google } from "googleapis";
import { DateTime } from "luxon";

const SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.freebusy"
];

const TIME_ZONE = "America/New_York";

const APPOINTMENT_SLOTS = [
    "09:00",
    "10:00",
    "11:30",
    "13:00",
    "14:30",
    "16:00"
];

const APPOINTMENT_LENGTH_MINUTES = 20;


/* =========================================================
   CREATE BASE OAUTH CLIENT
   ========================================================= */

function createOAuthClient() {

    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

}


/* =========================================================
   CREATE AUTHENTICATED OAUTH CLIENT
   ========================================================= */

function createAuthenticatedOAuthClient() {

    const oauth2Client =
        createOAuthClient();

    console.log(
        "ENV refresh token exists:",
        Boolean(process.env.GOOGLE_REFRESH_TOKEN)
    );

    if (!process.env.GOOGLE_REFRESH_TOKEN) {
        throw new Error(
            "GOOGLE_REFRESH_TOKEN is missing."
        );
    }

    oauth2Client.setCredentials({
        refresh_token:
            process.env.GOOGLE_REFRESH_TOKEN
    });

    console.log(
        "OAuth client refresh token exists:",
        Boolean(
            oauth2Client.credentials.refresh_token
        )
    );

    return oauth2Client;
}


/* =========================================================
   CREATE GOOGLE AUTH URL
   ========================================================= */

export function getGoogleAuthURL() {

    const oauth2Client =
        createOAuthClient();

    return oauth2Client.generateAuthUrl({

        access_type: "offline",

        prompt: "consent",

        scope: SCOPES

    });

}


/* =========================================================
   HANDLE GOOGLE CALLBACK
   ========================================================= */

export async function handleGoogleCallback(code) {

    const oauth2Client =
        createOAuthClient();

    const { tokens } =
        await oauth2Client.getToken(code);

    return tokens;

}


/* =========================================================
   GET CALENDAR
   ========================================================= */
function getCalendar() {

    const oauth2Client =
        createAuthenticatedOAuthClient();

    return google.calendar({
        version: "v3",
        auth: oauth2Client
    });

}


/* =========================================================
   CREATE DATE OBJECT
   ========================================================= */

function createAppointmentDate(date, time) {

    const appointment =
        DateTime.fromISO(
            `${date}T${time}`,
            {
                zone: TIME_ZONE
            }
        );

    if (!appointment.isValid) {
        throw new Error(
            "Invalid appointment date or time."
        );
    }

    return appointment.toJSDate();
}

/* =========================================================
   CHECK AVAILABLE APPOINTMENTS
   ========================================================= */

export async function getAvailableTimes(date) {

    const calendar =
        getCalendar();

    const day =
        DateTime.fromISO(
            date,
            {
                zone: TIME_ZONE
            }
        );

    if (!day.isValid) {
        throw new Error(
            "Invalid booking date."
        );
    }

    const dayStart =
        day.startOf("day");

    const dayEnd =
        day.endOf("day");

    // Ask Google which portions of the day are busy
    const response =
        await calendar.freebusy.query({

            requestBody: {

                timeMin:
                    dayStart.toISO(),

                timeMax:
                    dayEnd.toISO(),

                timeZone:
                    TIME_ZONE,

                items: [
                    {
                        id: process.env.GOOGLE_CALENDAR_ID
                    }
                ]

            }

        });


    const calendarId =
        process.env.GOOGLE_CALENDAR_ID;

    const busyTimes =
        response.data.calendars[calendarId]?.busy || [];

        
    console.log(
        "Google busy times:",
        busyTimes
    );

    const availableTimes =
        APPOINTMENT_SLOTS.filter(time => {

            const appointmentStart =
                createAppointmentDate(
                    date,
                    time
                );

            const appointmentEnd =
                new Date(
                    appointmentStart.getTime() +
                    APPOINTMENT_LENGTH_MINUTES *
                    60 *
                    1000
                );


            const hasConflict =
                busyTimes.some(busy => {

                    const busyStart =
                        new Date(busy.start);

                    const busyEnd =
                        new Date(busy.end);


                    return (
                        appointmentStart < busyEnd &&
                        appointmentEnd > busyStart
                    );

                });


            return !hasConflict;

        });


    return availableTimes;
}


/* =========================================================
   CHECK ONE SPECIFIC SLOT
   ========================================================= */

export async function isTimeAvailable(
    date,
    time
) {

    const availableTimes =
        await getAvailableTimes(date);

    return availableTimes.includes(time);
}


/* =========================================================
   CREATE CALENDAR EVENT
   ========================================================= */

export async function createCalendarEvent({
    name = "Test Customer",
    business = "Test Business",
    email = "",
    phone = "",
    businessType = "",
    website = "",
    date = "2026-09-29",
    time = "14:00"
} = {}) {

    const calendar =
        getCalendar();


    // Check availability AGAIN immediately before booking
    const available =
        await isTimeAvailable(
            date,
            time
        );


    if (!available) {

        throw new Error(
            "That appointment time is no longer available."
        );

    }


    const start =
        createAppointmentDate(
            date,
            time
        );


    const end =
        new Date(
            start.getTime() +
            APPOINTMENT_LENGTH_MINUTES *
            60 *
            1000
        );


    const event = {

        summary:
            `TNaxis Demo — ${business}`,

        description:
    `TNaxis Demo

    Name: ${name}
    Business: ${business}
    Email: ${email}
    Phone: ${phone || "Not provided"}
    Business Type: ${businessType || "Not provided"}
    Website: ${website || "Not provided"}`,

        start: {

            dateTime:
                start.toISO(),

            timeZone:
                TIME_ZONE

        },

        end: {

            dateTime:
                end.toISO(),

            timeZone:
                TIME_ZONE

        },

        attendees: [
            {
                email: email
            }
        ],

        conferenceData: {

            createRequest: {

                requestId:
                    `tnaxis-${Date.now()}`,

                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                }

            }

        }

    };


    const response =
        await calendar.events.insert({

            calendarId:
                process.env.GOOGLE_CALENDAR_ID,

            conferenceDataVersion:
                1,

            sendUpdates:
                "all",

            requestBody:
                event

        });


    return response.data;
}