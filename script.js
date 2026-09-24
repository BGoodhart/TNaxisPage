/* =========================================================
   TNAXIS MAIN WEBSITE
   ========================================================= */


/* ---------------------------------------------------------
   LOAD SHARED FOOTER
   --------------------------------------------------------- */

const footerPlaceholder =
    document.getElementById("footer-placeholder");

if (footerPlaceholder) {

    fetch("footer.html")
        .then(response => {

            if (!response.ok) {
                throw new Error("Could not load footer.");
            }

            return response.text();

        })
        .then(html => {

            // Insert footer into page
            footerPlaceholder.innerHTML = html;


            // Automatically update copyright year
            const currentYear =
                document.getElementById("current-year");

            if (currentYear) {

                currentYear.textContent =
                    new Date().getFullYear();

            }

        })
        .catch(error => {

            console.error(
                "Footer loading error:",
                error
            );

        });

}


/* ---------------------------------------------------------
   PAGE ENTRANCE
   --------------------------------------------------------- */

// Make sure a previous transition state is cleared.
document.body.classList.remove("page-leaving");

document.body.classList.add("page-entering");

requestAnimationFrame(() => {

    requestAnimationFrame(() => {

        document.body.classList.remove(
            "page-entering"
        );

    });

});


/* ---------------------------------------------------------
   PREPARE PAGE BEFORE BROWSER CACHE
   --------------------------------------------------------- */

window.addEventListener("pagehide", function () {

    // Do not allow the browser to save the page
    // visually in its faded-out state.
    document.body.classList.remove("page-leaving");
    document.body.classList.remove("page-entering");

});


/* ---------------------------------------------------------
   PAGE LINK TRANSITIONS
   --------------------------------------------------------- */

/*
 * Apply transitions to:
 *
 * - .html pages
 * - the clean homepage URL "/"
 *
 * Section links such as /#features are intentionally not
 * included because those should jump directly to a section.
 */

const pageLinks =
    document.querySelectorAll(
        'a[href$=".html"], a[href="/"]'
    );

pageLinks.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            const destination =
                link.getAttribute("href");


            /*
             * Ignore links opening in another tab.
             */

            if (link.target === "_blank") {
                return;
            }


            /*
             * Ignore modified clicks such as:
             *
             * Ctrl + Click
             * Command + Click
             * Shift + Click
             * Alt + Click
             */

            if (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }


            /*
             * Prevent instant navigation.
             */

            event.preventDefault();


            /*
             * Prevent multiple clicks while the
             * transition is already happening.
             */

            if (
                document.body.classList.contains(
                    "page-leaving"
                )
            ) {
                return;
            }


            /*
             * Start page transition.
             *
             * Navbar remains unchanged.
             */

            document.body.classList.add(
                "page-leaving"
            );


            /*
             * Navigate after transition finishes.
             */

            setTimeout(() => {

                window.location.href =
                    destination;

            }, 280);

        }
    );

});


/* ---------------------------------------------------------
   SECTION FADE-IN ANIMATION
   --------------------------------------------------------- */

const sections =
    document.querySelectorAll(
        ".section, .cta"
    );


/*
 * Only create the observer if there are sections
 * on the current page that need animation.
 */

if (sections.length > 0) {

    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "show"
                        );


                        /*
                         * Stop observing once visible.
                         * Prevents unnecessary work.
                         */

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.08
            }

        );


    sections.forEach(section => {

        section.classList.add(
            "hidden"
        );

        observer.observe(
            section
        );

    });

}