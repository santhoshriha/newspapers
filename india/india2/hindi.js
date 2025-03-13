document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Selections
    const newspaperGrid = document.getElementById('newspaper-grid');
    const searchInput = document.getElementById('search-input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const addNewspaperBtn = document.getElementById('add-newspaper-btn');
    const addNewspaperModal = document.getElementById('add-newspaper-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const addNewspaperForm = document.getElementById('add-newspaper-form');
    const themeToggle = document.getElementById('theme-toggle');
    const favoritesBtn = document.getElementById('favorites-btn');

    // State Management
    let newspapers = [];
    let filteredNewspapers = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let addedNewspapers = JSON.parse(localStorage.getItem('addedNewspapers')) || [];
    let currentCategory = 'all';
    let currentSearchTerm = '';

    // Fetch favicon from Google
    async function getFavicon(websiteUrl) {
        try {
            // Extract domain from URL
            const domain = new URL(websiteUrl).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}`;
        } catch (error) {
            console.error('Error fetching favicon:', error);
            return 'https://via.placeholder.com/50?text=News'; // Fallback image
        }
    }

    // Dynamically load newspapers
    function loadNewspapers() {
        fetch('hi.json')
            .then(response => response.json())
            .then(data => {
                // Combine original and added newspapers
                newspapers = [...data, ...addedNewspapers];
                filterAndRenderNewspapers();
            })
            .catch(error => console.error('Error loading newspapers:', error));
    }

    // Comprehensive filtering function
    function filterAndRenderNewspapers() {
        // Apply category filter
        filteredNewspapers = currentCategory === 'all' 
            ? newspapers 
            : newspapers.filter(newspaper => 
                newspaper.type.toLowerCase() === currentCategory
            );

        // Apply search filter
        if (currentSearchTerm) {
            filteredNewspapers = filteredNewspapers.filter(newspaper => 
                newspaper.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
            );
        }

        // Render filtered newspapers
        renderNewspapers(filteredNewspapers);
    }

    // Render newspapers
    function renderNewspapers(newspapersToRender) {
        newspaperGrid.innerHTML = '';
        newspapersToRender.forEach(newspaper => {
            const card = document.createElement('div');
            card.classList.add('newspaper-card');
            card.innerHTML = `
                <img src="${newspaper.image}" alt="${newspaper.name}">
                <h3>${newspaper.name}</h3>
                <p class="newspaper-type">${newspaper.type}</p>
                <div class="card-actions">
                    <button class="favorite-btn" data-name="${newspaper.name}">
                        <i class="fas ${favorites.includes(newspaper.name) ? 'fa-heart' : 'fa-heart-broken'}"></i>
                    </button>
                </div>
            `;
            newspaperGrid.appendChild(card);

            // Add click event to the entire card, but prevent triggering when favorite icon is clicked
            card.addEventListener('click', (event) => {
                // Check if the click was on the favorite button or its icon
                if (!event.target.closest('.favorite-btn')) {
                    window.open(newspaper.website, '_blank');
                }
            });
        });

        // Update favorite and visit button event listeners
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', toggleFavorite);
        });

        // Display message if no newspapers found
        if (newspapersToRender.length === 0) {
            newspaperGrid.innerHTML = `
                <div class="no-results">
                    <p>कोई समाचार पत्र नहीं मिला</p>
                </div>
            `;
        }
    }

    // Toggle favorite newspapers
    function toggleFavorite(event) {
        const newspaperName = event.currentTarget.dataset.name;
        const heartIcon = event.currentTarget.querySelector('i');

        if (favorites.includes(newspaperName)) {
            favorites = favorites.filter(name => name !== newspaperName);
            heartIcon.classList.remove('fa-heart');
            heartIcon.classList.add('fa-heart-broken');
        } else {
            favorites.push(newspaperName);
            heartIcon.classList.remove('fa-heart-broken');
            heartIcon.classList.add('fa-heart');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Modal Open and Close
    addNewspaperBtn.addEventListener('click', () => {
        addNewspaperModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        addNewspaperModal.style.display = 'none';
    });

    // Add Newspaper Form Submission
    addNewspaperForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('newspaper-name').value.trim();
        const website = document.getElementById('newspaper-website').value.trim();
        const language = document.getElementById('newspaper-language').value;
        const type = document.getElementById('newspaper-type').value;
        const logoFile = document.getElementById('newspaper-logo').files[0];

        // Validate inputs
        if (!name || !website) {
            alert('कृपया सभी आवश्यक फ़ील्ड भरें');
            return;
        }

        try {
            // Get favicon
            const faviconUrl = await getFavicon(website);

            // Create new newspaper object
            const newNewspaper = {
                name,
                website,
                language,
                type,
                image: logoFile ? URL.createObjectURL(logoFile) : faviconUrl
            };

            // Add to added newspapers and save to local storage
            addedNewspapers.push(newNewspaper);
            localStorage.setItem('addedNewspapers', JSON.stringify(addedNewspapers));

            // Update newspapers and re-render
            newspapers = [...newspapers, newNewspaper];
            filterAndRenderNewspapers();

            // Close modal and reset form
            addNewspaperModal.style.display = 'none';
            addNewspaperForm.reset();
        } catch (error) {
            console.error('Error adding newspaper:', error);
            alert('समाचार पत्र जोड़ने में त्रुटि');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (event) => {
        currentSearchTerm = event.target.value;
        filterAndRenderNewspapers();
    });

    // Category filtering
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.dataset.category;
            filterAndRenderNewspapers();
        });
    });

    // Favorites View
    favoritesBtn.addEventListener('click', () => {
        const favoriteNewspapers = newspapers.filter(newspaper => 
            favorites.includes(newspaper.name)
        );
        renderNewspapers(favoriteNewspapers);
    });

    // Theme Toggle Functionality
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        // Toggle dark mode on body
        document.body.classList.toggle('dark-mode');
        
        // Save theme preference
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    });

    // Initial load of newspapers
    loadNewspapers();
});