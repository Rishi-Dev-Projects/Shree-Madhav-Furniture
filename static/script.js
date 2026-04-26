/* ===================================
   SHREE MADHAV FURNITURE - JAVASCRIPT
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Elements ----
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const backToTop = document.getElementById('backToTop');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // ---- Create Mobile Nav Overlay ----
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // ---- Navbar Scroll Effect ----
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        // Add scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (currentScroll > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        lastScroll = currentScroll;
    });

    // ---- Mobile Nav Toggle ----
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close nav on overlay click
    overlay.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close nav on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ---- Active Nav Link on Scroll ----
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                allNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // ---- Product Filtering ----
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            productCards.forEach(card => {
                const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
                if (filter === 'all' || categories.includes(filter)) {
                    card.classList.remove('hidden');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ---- Category Cards Filtering ----
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const filterValue = card.dataset.filter;
            const targetBtn = Array.from(filterBtns).find(btn => btn.dataset.filter === filterValue);
            if (targetBtn) {
                targetBtn.click();
            }
        });
    });

    // ---- Contact Form ----
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const furnitureType = document.getElementById('furniture-type').value;
            const message = document.getElementById('message').value.trim();

            if (!name || !phone) {
                alert('Please enter your name and phone number.');
                return;
            }

            // Build WhatsApp message
            let waMessage = `Hi, I'm ${name}.%0A`;
            waMessage += `Phone: ${phone}%0A`;
            if (furnitureType) {
                waMessage += `Interested in: ${furnitureType}%0A`;
            }
            if (message) {
                waMessage += `Message: ${message}`;
            }

            // Show success message
            formSuccess.classList.add('show');
            contactForm.reset();

            // Open WhatsApp
            setTimeout(() => {
                window.open(`https://wa.me/919979466393?text=${waMessage}`, '_blank');
            }, 500);

            // Hide success after 5 seconds
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 5000);
        });
    }

    // ---- Back to Top ----
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- Scroll Animations ----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in to elements
    const fadeElements = document.querySelectorAll(
        '.benefit-item, .about-grid, .category-card, .product-filters, .product-card, .why-card, .testimonial-card, .contact-grid, .section-header, .products-cta'
    );
    
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---- Fullscreen Image Lightbox ----
    const galleryMain = document.querySelector('.product-gallery-main');
    if (galleryMain) {
        // Create lightbox overlay
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Close">✕</button>
            <img src="" alt="Fullscreen view">
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');

        // Open lightbox on image click
        galleryMain.addEventListener('click', () => {
            const img = galleryMain.querySelector('img');
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close lightbox
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        lightboxClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });

        lightbox.addEventListener('click', closeLightbox);

        // Prevent closing when clicking on image itself
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

});

// WhatsApp Tracking
document.querySelectorAll('.whatsapp-track, .nav-whatsapp, .btn-whatsapp, .whatsapp-float').forEach(btn => {
    btn.addEventListener('click', () => {
        fetch('/api/track-whatsapp', { method: 'POST' }).catch(console.error);
    });
});
