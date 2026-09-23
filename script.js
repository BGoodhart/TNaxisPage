/* =========================================================
   TNAXIS MAIN WEBSITE
   ========================================================= */


/* ---------------------------------------------------------
   PAGE ENTRANCE
   --------------------------------------------------------- */

document.body.classList.add("page-entering");


requestAnimationFrame(() => {

    requestAnimationFrame(() => {

        document.body.classList.remove("page-entering");

    });

});



/* ---------------------------------------------------------
   PAGE LINK TRANSITIONS
   --------------------------------------------------------- */

const pageLinks = document.querySelectorAll(
    'a[href$=".html"]'
);


pageLinks.forEach(link => {

    link.addEventListener("click", event => {

        const destination =
            link.getAttribute("href");


        /*
         * Do not interfere with links that open
         * in another tab.
         */

        if (link.target === "_blank") {
            return;
        }


        /*
         * Prevent the normal instant page change.
         */

        event.preventDefault();


        /*
         * Start page-content transition.
         * Navbar remains unchanged.
         */

        document.body.classList.add(
            "page-leaving"
        );


        /*
         * Navigate after animation finishes.
         */

        setTimeout(() => {

            window.location.href =
                destination;

        }, 280);

    });

});



/* ---------------------------------------------------------
   SECTION FADE-IN ANIMATION
   --------------------------------------------------------- */

const sections = document.querySelectorAll(
    ".section, .cta"
);


const observer = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add(
                    "show"
                );

            }

        });

    },

    {
        threshold: 0.08
    }

);



sections.forEach(section => {

    section.classList.add("hidden");

    observer.observe(section);

});



/* ---------------------------------------------------------
   AUTOMATIC COPYRIGHT YEAR
   --------------------------------------------------------- */

const currentYear =
    document.getElementById("current-year");


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}