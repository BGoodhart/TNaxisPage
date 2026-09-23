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

document.body.classList.add("page-entering");


requestAnimationFrame(() => {

    requestAnimationFrame(() => {

        document.body.classList.remove(
            "page-entering"
        );

    });

});



/* ---------------------------------------------------------
   PAGE LINK TRANSITIONS
   --------------------------------------------------------- */

const pageLinks =
    document.querySelectorAll(
        'a[href$=".html"]'
    );


pageLinks.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            const destination =
                link.getAttribute("href");


            /*
             * Ignore links opening in another tab
             */

            if (link.target === "_blank") {
                return;
            }


            /*
             * Prevent instant navigation
             */

            event.preventDefault();


            /*
             * Start page transition.
             * Navbar remains unchanged.
             */

            document.body.classList.add(
                "page-leaving"
            );


            /*
             * Navigate after transition finishes
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