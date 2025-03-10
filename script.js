document.addEventListener('DOMContentLoaded', () => {
    const newspaperList = document.getElementById('newspaper-list');
    const languageFilter = document.getElementById('language-filter');
    const categoryFilter = document.getElementById('category-filter');
    const searchBar = document.getElementById('search-bar');
    const searchBtn = document.getElementById('search-btn');
    const favoritesBtn = document.getElementById('favorites-btn');
    const bottomNavItems = document.querySelectorAll('.nav-item');
    const settingsSection = document.getElementById('settings-section');
    const newNewspaperForm = document.getElementById('new-newspaper-form');
    const newspaperNameInput = document.getElementById('newspaper-name');
    const newspaperWebsiteInput = document.getElementById('newspaper-website');
    const newspaperLanguageInput = document.getElementById('newspaper-language');
    const newspaperCategoryInput = document.getElementById('newspaper-category');
    const newspaperLogoInput = document.getElementById('newspaper-logo');

    // Drawer Menu Elements
    const drawerMenu = document.querySelector('.drawer-menu');
    const openDrawerBtn = document.querySelector('.open-drawer');
    const closeDrawerBtn = document.querySelector('.close-drawer');
    const drawerItems = document.querySelectorAll('.drawer-item');

    // Theme Toggle
    const themeSwitch = document.getElementById('theme-switch');

    // Filter Modal Elements
    const languageFilterIcon = document.getElementById('language-filter-icon');
    const categoryFilterIcon = document.getElementById('category-filter-icon');
    const languageFilterModal = document.getElementById('language-filter-modal');
    const categoryFilterModal = document.getElementById('category-filter-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    let newspapers = [];
    let favorites = JSON.parse(localStorage.getItem('favoriteNewspapers')) || [];
    let customNewspapers = JSON.parse(localStorage.getItem('customNewspapers')) || [];

    // Function to apply dark mode
    function applyDarkMode(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        
        // Update theme switch state
        themeSwitch.checked = isDark;

        // Save preference to local storage
        localStorage.setItem('darkMode', isDark);
    }

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';

    // Initial theme setup
    applyDarkMode(savedDarkMode);

    // Theme toggle event listener
    themeSwitch.addEventListener('change', () => {
        const isDarkMode = themeSwitch.checked;
        applyDarkMode(isDarkMode);
    });

    // Optional: Add system dark mode detection
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Listen for changes in system dark mode preference
    prefersDarkScheme.addListener((e) => {
        if (e.matches) {
            applyDarkMode(true);
        } else {
            applyDarkMode(false);
        }
    });

    // Filter Modal Functionality
    function openModal(modal) {
        modal.style.display = 'flex';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // Open modals when filter icons are clicked
    languageFilterIcon.addEventListener('click', () => openModal(languageFilterModal));
    categoryFilterIcon.addEventListener('click', () => openModal(categoryFilterModal));

    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const modal = e.target.closest('.filter-modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-modal')) {
            closeModal(e.target);
        }
    });

    // Drawer Menu Functionality
    function openDrawer() {
        drawerMenu.classList.add('open');
    }

    function closeDrawer() {
        drawerMenu.classList.remove('open');
    }

    // Attach drawer menu event listeners
    openDrawerBtn.addEventListener('click', openDrawer);
    closeDrawerBtn.addEventListener('click', closeDrawer);

    // Drawer Navigation Enhanced
    drawerItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all drawer items
            drawerItems.forEach(drawerItem => drawerItem.classList.remove('active'));
            item.classList.add('active');

            const tab = item.dataset.tab;
            switch(true) {
                case tab === 'newspapers':
                    settingsSection.style.display = 'none';
                    newspaperList.style.display = 'grid';
                    applyFilters();
                    break;
                case tab === 'favorites':
                    settingsSection.style.display = 'none';
                    newspaperList.style.display = 'grid';
                    displayNewspapers(newspapers, true);
                    break;
                case tab === 'settings':
                    newspaperList.style.display = 'none';
                    settingsSection.style.display = 'block';
                    break;
                case tab.startsWith('language-'):
                    const language = tab.split('-')[1];
                    settingsSection.style.display = 'none';
                    newspaperList.style.display = 'grid';
                    displayNewspapers(newspapers.filter(newspaper => 
                        newspaper.language.toLowerCase() === language.toLowerCase()
                    ));
                    break;
                case tab.startsWith('category-'):
                    const category = tab.split('-')[1];
                    settingsSection.style.display = 'none';
                    newspaperList.style.display = 'grid';
                    displayNewspapers(newspapers.filter(newspaper => 
                        newspaper.type.toLowerCase() === category.toLowerCase()
                    ));
                    break;
                case tab === 'add-newspaper':
                    settingsSection.style.display = 'block';
                    newspaperList.style.display = 'none';
                    break;
                case tab === 'about':
                    // TODO: Implement about section
                    alert('About section coming soon!');
                    break;
            }
            
            // Close drawer after selection
            closeDrawer();
        });
    });

    // Enhanced filter function to support multiple filters
    function applyFilters(language = null, category = null) {
        let filteredNewspapers = newspapers;

        if (language) {
            filteredNewspapers = filteredNewspapers.filter(newspaper => 
                newspaper.language.toLowerCase() === language.toLowerCase()
            );
        }

        if (category) {
            filteredNewspapers = filteredNewspapers.filter(newspaper => 
                newspaper.type.toLowerCase() === category.toLowerCase()
            );
        }

        displayNewspapers(filteredNewspapers);
    }

    // Fetch newspapers from JSON
    async function fetchNewspapers() {
        try {
            const response = await fetch('newspapers.json');
            let fetchedNewspapers = await response.json();
            
            // Merge fetched newspapers with custom newspapers
            newspapers = [...fetchedNewspapers, ...customNewspapers];
            displayNewspapers(newspapers);
        } catch (error) {
            console.error('Error fetching newspapers:', error);
            newspaperList.innerHTML = '<p>Unable to load newspapers. Please try again later.</p>';
        }
    }

    // Function to generate favicon from website URL
    function getFaviconUrl(websiteUrl) {
        try {
            const url = new URL(websiteUrl);
            // Use Google's favicon service
            return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
        } catch (error) {
            console.error('Invalid URL:', websiteUrl);
            // Fallback to default favicon generation
            return generateDefaultFavicon(websiteUrl);
        }
    }

    // Function to generate default favicon
    function generateDefaultFavicon(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Use first two letters of the name
        const initials = name.substring(0, 2).toUpperCase();
        ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL();
    }

    // Display newspapers with filtering
    function displayNewspapers(filteredNewspapers, showFavoritesOnly = false) {
        newspaperList.innerHTML = '';
        const newspapersToDisplay = showFavoritesOnly 
            ? newspapers.filter(n => favorites.includes(n.name)) 
            : filteredNewspapers;

        newspapersToDisplay.forEach(newspaper => {
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            
            // Use dynamic favicon URL
            const faviconUrl = getFaviconUrl(newspaper.website);
            
            newsItem.innerHTML = `
                <div class="news-item-content">
                    <img src="${faviconUrl}" alt="${newspaper.name} Logo" class="news-logo">
                    <h3>${newspaper.name}</h3>
                    <p>${newspaper.language}</p>
                    <div class="favorite-toggle ${favorites.includes(newspaper.name) ? 'active' : ''}" data-name="${newspaper.name}">
                        <i class="fas fa-heart"></i>
                    </div>
                </div>
            `;

            // Add click event listener to open website
            newsItem.querySelector('.news-item-content').addEventListener('click', (event) => {
                // Check if the click was on the heart icon
                if (!event.target.closest('.favorite-toggle')) {
                    window.open(newspaper.website, '_blank');
                }
            });

            newspaperList.appendChild(newsItem);
        });

        // Re-attach favorite toggle listeners
        attachFavoriteToggleListeners();
    }

    // Delete custom newspaper
    function deleteCustomNewspaper(newspaperName) {
        // Remove from custom newspapers
        customNewspapers = customNewspapers.filter(n => n.name !== newspaperName);
        localStorage.setItem('customNewspapers', JSON.stringify(customNewspapers));

        // Remove from main newspapers array
        newspapers = newspapers.filter(n => n.name !== newspaperName);

        // Remove from favorites if exists
        const favoriteIndex = favorites.indexOf(newspaperName);
        if (favoriteIndex > -1) {
            favorites.splice(favoriteIndex, 1);
            localStorage.setItem('favoriteNewspapers', JSON.stringify(favorites));
        }

        // Redisplay newspapers
        displayNewspapers(newspapers);
    }

    // Toggle favorite status
    function toggleFavorite(newspaperName, iconElement) {
        const index = favorites.indexOf(newspaperName);
        if (index > -1) {
            // Remove from favorites
            favorites.splice(index, 1);
            iconElement.classList.remove('active');
        } else {
            // Add to favorites
            favorites.push(newspaperName);
            iconElement.classList.add('active');
        }
        
        // Save to local storage
        localStorage.setItem('favoriteNewspapers', JSON.stringify(favorites));
    }

    // Attach favorite toggle listeners
    function attachFavoriteToggleListeners() {
        const favoriteToggles = document.querySelectorAll('.favorite-toggle');
        favoriteToggles.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent opening website when clicking heart
                const newspaperName = toggle.dataset.name;
                
                // Toggle favorite status
                if (favorites.includes(newspaperName)) {
                    favorites = favorites.filter(name => name !== newspaperName);
                    toggle.classList.remove('active');
                } else {
                    favorites.push(newspaperName);
                    toggle.classList.add('active');
                }
                
                // Save to local storage
                localStorage.setItem('favoriteNewspapers', JSON.stringify(favorites));
            });
        });
    }

    // Filtering functionality
    function applyFilters() {
        const selectedLanguage = languageFilter.value;
        const selectedCategory = categoryFilter.value;

        let filteredNewspapers = newspapers;

        // Language filter
        if (selectedLanguage !== 'All') {
            filteredNewspapers = filteredNewspapers.filter(n => n.language === selectedLanguage);
        }

        // Category filter
        if (selectedCategory !== 'All') {
            filteredNewspapers = filteredNewspapers.filter(n => n.type === selectedCategory);
        }

        // Search filter
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm) {
            filteredNewspapers = filteredNewspapers.filter(newspaper => 
                newspaper.name.toLowerCase().includes(searchTerm) ||
                newspaper.language.toLowerCase().includes(searchTerm)
            );
        }

        displayNewspapers(filteredNewspapers);
    }

    // Search functionality
    searchBar.addEventListener('input', applyFilters);
    searchBtn.addEventListener('click', applyFilters);

    // Language and Category filter
    languageFilter.addEventListener('change', () => {
        applyFilters();
        closeModal(languageFilterModal);
    });
    categoryFilter.addEventListener('change', () => {
        applyFilters();
        closeModal(categoryFilterModal);
    });

    // Add New Newspaper Form Submission
    newNewspaperForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!newspaperNameInput.value || !newspaperWebsiteInput.value || 
            !newspaperLanguageInput.value || !newspaperCategoryInput.value) {
            alert('Please fill in all required fields.');
            return;
        }

        // Prepare new newspaper object
        const newNewspaper = {
            name: newspaperNameInput.value,
            website: newspaperWebsiteInput.value,
            language: newspaperLanguageInput.value,
            type: newspaperCategoryInput.value,
            logo: newspaperLogoInput.value || getFaviconUrl(newspaperWebsiteInput.value),
            isCustom: true // Flag to identify custom added newspapers
        };

        try {
            // Check if newspaper already exists in both default and custom newspapers
            const isDuplicate = newspapers.some(
                newspaper => newspaper.name.toLowerCase() === newNewspaper.name.toLowerCase()
            );

            if (isDuplicate) {
                alert('A newspaper with this name already exists.');
                return;
            }

            // Add to custom newspapers in local storage
            customNewspapers.push(newNewspaper);
            localStorage.setItem('customNewspapers', JSON.stringify(customNewspapers));

            // Update local newspapers array and display
            newspapers.push(newNewspaper);
            displayNewspapers(newspapers);

            // Reset form
            newNewspaperForm.reset();

            // Show success message
            alert('Newspaper added successfully!');

            // Switch to newspapers tab
            document.querySelector('.nav-item[data-tab="newspapers"]').click();

        } catch (error) {
            console.error('Error adding newspaper:', error);
            alert('Failed to add newspaper. Please try again.');
        }
    });

    // Bottom Navigation
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items
            bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');

            const tab = item.dataset.tab;
            switch(tab) {
                case 'newspapers':
                    settingsSection.style.display = 'none';
                    newspaperList.style.display = 'grid';
                    applyFilters();
                    break;
                case 'favorites':
                    settingsSection.style.display = 'none';
                    newspaperList.style.display = 'grid';
                    displayNewspapers(newspapers, true);
                    break;
                case 'settings':
                    newspaperList.style.display = 'none';
                    settingsSection.style.display = 'block';
                    break;
            }
        });
    });

    // Initial load
    fetchNewspapers();
});
