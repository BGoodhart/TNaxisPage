// Simple fade-in animation
const sections = document.querySelectorAll('.section, .cta');

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