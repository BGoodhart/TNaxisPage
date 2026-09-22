// Book Demo button
const demoButtons = document.querySelectorAll(
    '.nav-button, .primary-button, .cta button'
);

demoButtons.forEach(button => {
    button.addEventListener('click', () => {
        alert('Demo booking will be available soon!');
    });
});


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