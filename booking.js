/* =========================================================
   TNAXIS BOOKING SYSTEM
   Front-end demo version
   ========================================================= */


/* ---------------------------------------------------------
   ELEMENTS
   --------------------------------------------------------- */

const businessForm = document.getElementById("business-form");

const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");

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
let selectedTime = null;


/*
  TEMPORARY AVAILABLE TIMES

  Later these will come from your real calendar
  or scheduling service.
*/

const availableTimes = [
  "9:00 AM",
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM"
];


/* ---------------------------------------------------------
   STEP 1
   BUSINESS INFORMATION
   --------------------------------------------------------- */

businessForm.addEventListener("submit", function(event) {

  event.preventDefault();

  if (!businessForm.checkValidity()) {

    businessForm.reportValidity();

    return;
  }

  showStep(2);

});


/* ---------------------------------------------------------
   BACK BUTTON
   --------------------------------------------------------- */

if (backButton) {
  backButton.addEventListener("click", function(event) {
    event.preventDefault();
    showStep(1);
  });
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

    progressBusiness.classList.add("active");

  }


  if (stepNumber === 2) {

    step2.classList.add("active");

    progressBusiness.classList.add("complete");

    progressSchedule.classList.add("active");

  }


  if (stepNumber === 3) {

    step3.classList.add("active");

    progressBusiness.classList.add("complete");

    progressSchedule.classList.add("complete");

    progressConfirm.classList.add("active");

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

  const today = new Date();

  let daysAdded = 0;

  let offset = 1;


  /*
    Show the next five weekdays.
  */

  while (daysAdded < 5) {

    const date = new Date(today);

    date.setDate(
      today.getDate() + offset
    );


    const dayOfWeek = date.getDay();


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

  button.type = "button";

  button.className = "date-option";


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


  dateOptions.appendChild(button);

}


/* ---------------------------------------------------------
   SELECT DATE
   --------------------------------------------------------- */

function selectDate(date, button) {

  selectedDate = date;

  selectedTime = null;


  /*
    Remove previous date selection.
  */

  document
    .querySelectorAll(".date-option")
    .forEach(function(option) {

      option.classList.remove("selected");

    });


  button.classList.add("selected");


  /*
    Reset booking button.
  */

  bookDemoButton.disabled = true;

  selectedAppointment.classList.remove(
    "visible"
  );


  /*
    Update time heading.
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


  generateTimeOptions();

}


/* ---------------------------------------------------------
   GENERATE TIMES
   --------------------------------------------------------- */

function generateTimeOptions() {

  timeOptions.innerHTML = "";


  availableTimes.forEach(function(time) {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className = "time-option";

    button.textContent = time;


    button.addEventListener(
      "click",
      function() {

        selectTime(
          time,
          button
        );

      }
    );


    timeOptions.appendChild(button);

  });

}


/* ---------------------------------------------------------
   SELECT TIME
   --------------------------------------------------------- */

function selectTime(time, button) {

  selectedTime = time;


  document
    .querySelectorAll(".time-option")
    .forEach(function(option) {

      option.classList.remove("selected");

    });


  button.classList.add("selected");


  const formattedDate =
    selectedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric"
      }
    );


  selectedTimeText.textContent =
    `${formattedDate} at ${selectedTime}`;


  selectedAppointment.classList.add(
    "visible"
  );


  bookDemoButton.disabled = false;

}


/* ---------------------------------------------------------
   BOOK DEMO
   --------------------------------------------------------- */

bookDemoButton.addEventListener(
  "click",
  function() {

    if (
      !selectedDate ||
      !selectedTime
    ) {

      return;

    }


    fillConfirmation();

    showStep(3);

  }
);


/* ---------------------------------------------------------
   CONFIRMATION INFORMATION
   --------------------------------------------------------- */

function fillConfirmation() {

  const name =
    document.getElementById("name").value;

  const business =
    document.getElementById("business").value;

  const email =
    document.getElementById("email").value;


  const formattedDate =
    selectedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );


  document.getElementById(
    "confirmation-date"
  ).textContent =
    `${formattedDate} at ${selectedTime}`;


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