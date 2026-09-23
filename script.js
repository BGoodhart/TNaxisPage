/* =========================================================
   TNAXIS MAIN WEBSITE
   ========================================================= */


/* ---------------------------------------------------------
   PAGE ENTRANCE
   --------------------------------------------------------- */

document.body.classList.add('page-entering');

requestAnimationFrame(() => {

    requestAnimationFrame(() => {

        document.body.classList.remove('page-entering');

    });

});


/* ---------------------------------------------------------
   PAGE LINK TRANSITIONS
   --------------------------------------------------------- */

const pageLinks = document.querySelectorAll(
    'a[href$=".html"]'
);

pageLinks.forEach(link => {

    link.addEventListener('click', event => {

        const destination = link.getAttribute('href');

        if (link.target === '_blank') {
            return;
        }

        event.preventDefault();

        document.body.classList.add('page-leaving');

        setTimeout(() => {

            window.location.href = destination;

        }, 280);

    });

});


/* ---------------------------------------------------------
   SECTION FADE-IN ANIMATION
   --------------------------------------------------------- */

const sections = document.querySelectorAll(
    '.section, .cta'
);

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }

    });

});


sections.forEach(section => {

    section.classList.add('hidden');

    observer.observe(section);

});