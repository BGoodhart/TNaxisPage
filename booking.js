/* =========================================================
   TNAXIS BOOKING SYSTEM
   Google Calendar Integration
   ========================================================= */


/* ---------------------------------------------------------
   API CONFIGURATION
   --------------------------------------------------------- */

// Local development backend.
// We will change this when the backend is deployed.
const API_URL = "https://tnaxisai.com";


/* ---------------------------------------------------------
   ELEMENTS
   --------------------------------------------------------- */

const businessForm =
    document.getElementById("business-form");

const step1 =
    document.getElementById("step-1");

const step2 =
    document.getElementById("step-2");

const step3 =
    document.getElementById("step-3");


const progressBusiness =
    document.getElementById("progress-business");

const progressSchedule =
    document.getElementById("progress-schedule");

const progressConfirm =
    document.getElementById("progress-confirm");


const backButton =
    document.getElementById("back-to-business");

const dateOptions =
    document.getElementById("date-options");

const timeOptions =
    document.getElementById("time-options");

const timeHeading =
    document.getElementById("time-heading");

const selectedAppointment =
    document.getElementById("selected-appointment");

const selectedTimeText =
    document.getElementById("selected-time-text");

const bookDemoButton =
    document.getElementById("book-demo-button");


/* ---------------------------------------------------------
   BOOKING DATA
   --------------------------------------------------------- */

let selectedDate = null;

let selectedDateString = null;

let selectedTime = null;


/* ---------------------------------------------------------
   STEP 1
   BUSINESS INFORMATION
   --------------------------------------------------------- */

businessForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (!businessForm.checkValidity()) {

            businessForm.reportValidity();

            return;

        }


        showStep(2);

    }
);


/* ---------------------------------------------------------
   BACK BUTTON
   --------------------------------------------------------- */

if (backButton) {

    backButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            showStep(1);

        }
    );

}


/* ---------------------------------------------------------
   STEP HANDLING
   --------------------------------------------------------- */

function showStep(stepNumber) {

    step1.classList.remove("active");
    step2.classList.remove("active");
    step3.classList.remove("active");


    progressBusiness.classList.remove(
        "active",
        "complete"
    );

    progressSchedule.classList.remove(
        "active",
        "complete"
    );

    progressConfirm.classList.remove(
        "active",
        "complete"
    );


    if (stepNumber === 1) {

        step1.classList.add("active");

        progressBusiness.classList.add(
            "active"
        );

    }


    if (stepNumber === 2) {

        step2.classList.add("active");

        progressBusiness.classList.add(
            "complete"
        );

        progressSchedule.classList.add(
            "active"
        );

    }


    if (stepNumber === 3) {

        step3.classList.add("active");

        progressBusiness.classList.add(
            "complete"
        );

        progressSchedule.classList.add(
            "complete"
        );

        progressConfirm.classList.add(
            "active"
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ---------------------------------------------------------
   GENERATE AVAILABLE DATES
   --------------------------------------------------------- */

function generateAvailableDates() {

    dateOptions.innerHTML = "";


    const today =
        new Date();


    let daysAdded = 0;

    let offset = 1;


    /*
       Show the next five weekdays.
    */

    while (daysAdded < 5) {

        const date =
            new Date(today);


        date.setDate(
            today.getDate() + offset
        );


        const dayOfWeek =
            date.getDay();


        /*
           Skip Saturday and Sunday.
        */

        if (
            dayOfWeek !== 0 &&
            dayOfWeek !== 6
        ) {

            createDateButton(date);

            daysAdded++;

        }


        offset++;

    }

}


/* ---------------------------------------------------------
   CREATE DATE BUTTON
   --------------------------------------------------------- */

function createDateButton(date) {

    const button =
        document.createElement("button");


    button.type =
        "button";

    button.className =
        "date-option";


    const weekday =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );


    const dateText =
        date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        );


    button.innerHTML = `
        <span class="date-day">
            ${weekday}
        </span>

        <span class="date-number">
            ${dateText}
        </span>
    `;


    button.addEventListener(
        "click",
        function() {

            selectDate(
                date,
                button
            );

        }
    );


    dateOptions.appendChild(
        button
    );

}


/* ---------------------------------------------------------
   FORMAT DATE FOR API

   Returns YYYY-MM-DD using local date values.
   --------------------------------------------------------- */

function formatDateForAPI(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* ---------------------------------------------------------
   SELECT DATE
   --------------------------------------------------------- */

async function selectDate(
    date,
    button
) {

    selectedDate =
        date;

    selectedDateString =
        formatDateForAPI(date);

    selectedTime =
        null;


    /*
       Remove previous selection.
    */

    document
        .querySelectorAll(
            ".date-option"
        )
        .forEach(
            function(option) {

                option.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    /*
       Reset booking controls.
    */

    bookDemoButton.disabled =
        true;


    selectedAppointment.classList.remove(
        "visible"
    );


    /*
       Update heading.
    */

    timeHeading.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );


    /*
       Show loading message.
    */

    timeOptions.innerHTML = `
        <p class="schedule-placeholder">
            Checking availability...
        </p>
    `;


    /*
       Ask TNaxis backend for actual
       Google Calendar availability.
    */

    try {

        const availableTimes =
            await getAvailableTimes(
                selectedDateString
            );


        generateTimeOptions(
            availableTimes
        );

    }

    catch (error) {

        console.error(
            "Availability error:",
            error
        );


        timeOptions.innerHTML = `
            <p class="schedule-placeholder">
                We couldn't load available times.
                Please try again.
            </p>
        `;

    }

}


/* ---------------------------------------------------------
   GET REAL GOOGLE CALENDAR AVAILABILITY
   --------------------------------------------------------- */

async function getAvailableTimes(date) {

    const response =
        await fetch(
            `${API_URL}/api/availability?date=${encodeURIComponent(date)}`
        );


    const data =
        await response.json();


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Could not retrieve availability."
        );

    }


    return data.availableTimes;

}


/* ---------------------------------------------------------
   GENERATE TIME BUTTONS
   --------------------------------------------------------- */

function generateTimeOptions(
    availableTimes
) {

    timeOptions.innerHTML = "";


    /*
       No available appointments.
    */

    if (
        !availableTimes ||
        availableTimes.length === 0
    ) {

        timeOptions.innerHTML = `
            <p class="schedule-placeholder">
                No times are available on this day.
                Please choose another date.
            </p>
        `;

        return;

    }


    availableTimes.forEach(
        function(time) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";

            button.className =
                "time-option";


            /*
               Backend sends times such as:
               09:00
               13:00
               14:30

               Convert them to:
               9:00 AM
               1:00 PM
               2:30 PM
            */

            button.textContent =
                formatTimeForDisplay(
                    time
                );


            button.addEventListener(
                "click",
                function() {

                    selectTime(
                        time,
                        button
                    );

                }
            );


            timeOptions.appendChild(
                button
            );

        }
    );

}


/* ---------------------------------------------------------
   FORMAT TIME FOR DISPLAY
   --------------------------------------------------------- */

function formatTimeForDisplay(time) {

    const parts =
        time.split(":");


    let hour =
        Number(parts[0]);

    const minutes =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {

        hour = 12;

    }


    return `${hour}:${minutes} ${period}`;

}


/* ---------------------------------------------------------
   SELECT TIME
   --------------------------------------------------------- */

function selectTime(
    time,
    button
) {

    /*
       Keep API value such as "14:30".
    */

    selectedTime =
        time;


    document
        .querySelectorAll(
            ".time-option"
        )
        .forEach(
            function(option) {

                option.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    const formattedDate =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );


    const formattedTime =
        formatTimeForDisplay(
            selectedTime
        );


    selectedTimeText.textContent =
        `${formattedDate} at ${formattedTime}`;


    selectedAppointment.classList.add(
        "visible"
    );


    bookDemoButton.disabled =
        false;

}


/* ---------------------------------------------------------
   BOOK DEMO
   --------------------------------------------------------- */

bookDemoButton.addEventListener(
    "click",
    async function() {

        if (
            !selectedDateString ||
            !selectedTime
        ) {

            return;

        }


        /*
           Prevent double clicking while
           the booking is being created.
        */

        bookDemoButton.disabled =
            true;


        const originalButtonHTML =
            bookDemoButton.innerHTML;


        bookDemoButton.textContent =
            "Scheduling...";


        try {

            const bookingData =
                getBookingData();


            await submitBooking(
                bookingData
            );


            fillConfirmation();


            showStep(3);

        }

        catch (error) {

            console.error(
                "Booking error:",
                error
            );


            alert(
                error.message ||
                "We couldn't schedule your demo. Please try again."
            );


            /*
               Refresh availability because
               another person may have taken
               the selected slot.
            */

            selectedTime =
                null;


            selectedAppointment.classList.remove(
                "visible"
            );


            try {

                const availableTimes =
                    await getAvailableTimes(
                        selectedDateString
                    );


                generateTimeOptions(
                    availableTimes
                );

            }

            catch (
                availabilityError
            ) {

                console.error(
                    "Could not refresh availability:",
                    availabilityError
                );

            }

        }

        finally {

            bookDemoButton.innerHTML =
                originalButtonHTML;


            /*
               Only enable again if the user
               still has a selected time.
            */

            bookDemoButton.disabled =
                !selectedTime;

        }

    }
);


/* ---------------------------------------------------------
   COLLECT BOOKING INFORMATION
   --------------------------------------------------------- */

function getBookingData() {

    return {

        name:
            document.getElementById(
                "name"
            ).value.trim(),

        business:
            document.getElementById(
                "business"
            ).value.trim(),

        email:
            document.getElementById(
                "email"
            ).value.trim(),

        phone:
            document.getElementById(
                "phone"
            ).value.trim(),

        businessType:
            document.getElementById(
                "business-type"
            ).value,

        website:
            document.getElementById(
                "website"
            ).value.trim(),

        date:
            selectedDateString,

        time:
            selectedTime

    };

}


/* ---------------------------------------------------------
   SEND BOOKING TO TNAXIS BACKEND
   --------------------------------------------------------- */

async function submitBooking(
    bookingData
) {

    const response =
        await fetch(
            `${API_URL}/api/book`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        bookingData
                    )
            }
        );


    let data;


    try {

        data =
            await response.json();

    }

    catch {

        throw new Error(
            "The booking server returned an invalid response."
        );

    }


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Could not schedule your demo."
        );

    }


    return data;

}


/* ---------------------------------------------------------
   CONFIRMATION INFORMATION
   --------------------------------------------------------- */

function fillConfirmation() {

    const name =
        document.getElementById(
            "name"
        ).value;


    const business =
        document.getElementById(
            "business"
        ).value;


    const email =
        document.getElementById(
            "email"
        ).value;


    const formattedDate =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                weekday:
                    "long",

                month:
                    "long",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        );


    const formattedTime =
        formatTimeForDisplay(
            selectedTime
        );


    document.getElementById(
        "confirmation-date"
    ).textContent =
        `${formattedDate} at ${formattedTime}`;


    document.getElementById(
        "confirmation-name"
    ).textContent =
        name;


    document.getElementById(
        "confirmation-business"
    ).textContent =
        business;


    document.getElementById(
        "confirmation-email"
    ).textContent =
        email;

}


/* ---------------------------------------------------------
   INITIALIZE PAGE
   --------------------------------------------------------- */

generateAvailableDates();