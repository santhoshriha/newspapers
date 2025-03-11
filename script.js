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

    // Close drawer when clicking outside
    window.addEventListener('click', (e) => {
        if (drawerMenu.classList.contains('open') && 
            !drawerMenu.contains(e.target) && 
            !openDrawerBtn.contains(e.target)) {
            closeDrawer();
        }
    });

    // Swipe Gesture for Drawer Menu
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50; // Minimum distance for a swipe to be recognized

    document.addEventListener('touchstart', (e) => {
        if (drawerMenu.classList.contains('open')) {
            touchStartX = e.changedTouches[0].screenX;
        }
    }, false);

    document.addEventListener('touchend', (e) => {
        if (drawerMenu.classList.contains('open')) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }
    }, false);

    function handleSwipe() {
        // Check if the drawer is open and the swipe is from right to left
        if (drawerMenu.classList.contains('open') && 
            touchStartX > touchEndX && 
            (touchStartX - touchEndX) > minSwipeDistance) {
            closeDrawer();
        }
    }

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
            
            // Generate language drawer items
            generateLanguageDrawerItems();
        } catch (error) {
            console.error('Error fetching newspapers:', error);
            newspaperList.innerHTML = '<p>Unable to load newspapers. Please try again later.</p>';
        }
    }

    // Enhanced favicon URL generation with multiple fallback methods
    function getFaviconUrl(websiteUrl) {
        try {
            const url = new URL(websiteUrl);
            
            // Special handling for specific websites
            const specialFaviconMap = {
                'timesofindia.indiatimes.com': [
                    'https://static.toiimg.com/favicon.ico',
                    'https://static.toiimg.com/photo/msid-67743611/favicon.ico',
                    'https://timesofindia.indiatimes.com/favicon.ico'
                ]
            };

            // Check for special favicon handling
            if (specialFaviconMap[url.hostname]) {
                return specialFaviconMap[url.hostname][0];
            }
            
            // Array of favicon retrieval methods with fallback options
            const faviconOptions = [
                // Direct favicon paths
                `${url.origin}/favicon.ico`,
                `${url.origin}/favicon.png`,
                `${url.origin}/apple-touch-icon.png`,
                
                // Google's favicon service (primary method)
                `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`,
                
                // Alternative favicon services
                `https://icon.horse/icon/${url.hostname}`,
                `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(websiteUrl)}`,
                
                // Fallback to default icon generation
                null
            ];

            // Synchronous fallback method
            for (let favicon of faviconOptions) {
                if (favicon) {
                    return favicon;
                }
            }

            // If all favicon methods fail, generate a default favicon
            return generateDefaultFavicon(url.hostname);

        } catch (error) {
            console.warn(`Favicon retrieval error for ${websiteUrl}:`, error);
            return generateDefaultFavicon(websiteUrl);
        }
    }

    // Improved default favicon generation
    function generateDefaultFavicon(name) {
        // Create a high-resolution canvas for better clarity
        const canvas = document.createElement('canvas');
        canvas.width = 256;  // Increased resolution
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Generate a consistent color based on the name
        const hashCode = name.split('').reduce((hash, char) => {
            return char.charCodeAt(0) + ((hash << 5) - hash);
        }, 0);
        
        // Create a more sophisticated color palette
        const hue = Math.abs(hashCode % 360);
        const backgroundColor = `hsl(${hue}, 70%, 50%)`;
        const gradientColor = `hsl(${hue}, 70%, 40%)`;

        // Create a gradient background for more depth
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, backgroundColor);
        gradient.addColorStop(1, gradientColor);
        
        // Draw gradient background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add a subtle texture
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Draw text with improved styling
        ctx.fillStyle = 'white';
        ctx.font = 'bold 120px Arial';  // Larger, bolder font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add subtle text shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Use first letter of the name
        const firstLetter = name.charAt(0).toUpperCase();
        ctx.fillText(firstLetter, canvas.width / 2, canvas.height / 2 + 20);

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Return high-quality image
        return canvas.toDataURL('image/png', 1.0);  // High-quality PNG
    }

    // Display newspapers with filtering
    function displayNewspapers(filteredNewspapers, showFavoritesOnly = false) {
        // Filter newspapers if in favorites mode
        if (showFavoritesOnly) {
            filteredNewspapers = filteredNewspapers.filter(newspaper => 
                favorites.includes(newspaper.name)
            );
        }

        // Filter by search query
        const searchQuery = searchBar.value.toLowerCase().trim();
        if (searchQuery) {
            filteredNewspapers = filteredNewspapers.filter(newspaper => 
                newspaper.name.toLowerCase().includes(searchQuery)
            );
        }

        // Clear existing newspapers
        newspaperList.innerHTML = '';

        // Create newspaper cards
        filteredNewspapers.forEach(newspaper => {
            const card = document.createElement('div');
            card.classList.add('newspaper-card');
            card.setAttribute('data-name', newspaper.name);

            // Card Header with Logo
            const cardHeader = document.createElement('div');
            cardHeader.classList.add('newspaper-card-header');
            const logoImg = document.createElement('img');
            
            // Prioritize logo, then favicon, then default favicon
            logoImg.src = newspaper.logo || 
                          getFaviconUrl(newspaper.website) || 
                          generateDefaultFavicon(newspaper.name);
            logoImg.alt = `${newspaper.name} Logo`;
            cardHeader.appendChild(logoImg);

            // Card Content
            const cardContent = document.createElement('div');
            cardContent.classList.add('newspaper-card-content');

            // Title
            const titleElement = document.createElement('h3');
            titleElement.classList.add('newspaper-card-title');
            titleElement.textContent = newspaper.name;
            cardContent.appendChild(titleElement);

            // Details Container
            const detailsContainer = document.createElement('div');
            detailsContainer.classList.add('newspaper-card-details');

            // Language
            const languageElement = document.createElement('div');
            languageElement.classList.add('newspaper-card-language');
            languageElement.innerHTML = `<i class="fas fa-globe"></i>${newspaper.language}`;
            detailsContainer.appendChild(languageElement);

            // Category
            const categoryElement = document.createElement('div');
            categoryElement.classList.add('newspaper-card-category');
            categoryElement.innerHTML = `<i class="fas fa-tag"></i>${newspaper.type}`;
            detailsContainer.appendChild(categoryElement);

            // Favorite Icon
            const favoriteIcon = document.createElement('div');
            favoriteIcon.classList.add('newspaper-card-favorite');
            const heartIcon = document.createElement('i');
            heartIcon.classList.add('fas', favorites.includes(newspaper.name) ? 'fa-heart' : 'fa-heart-broken');
            heartIcon.setAttribute('data-name', newspaper.name);
            favoriteIcon.appendChild(heartIcon);

            // Assemble Card
            cardContent.appendChild(detailsContainer);
            card.appendChild(cardHeader);
            card.appendChild(cardContent);
            card.appendChild(favoriteIcon);

            // Add click event to open newspaper (exclude favorite icon)
            card.addEventListener('click', (event) => {
                if (!event.target.closest('.newspaper-card-favorite')) {
                    window.open(newspaper.website, '_blank');
                }
            });

            // Prevent favorite icon from triggering card click
            favoriteIcon.addEventListener('click', (event) => {
                event.stopPropagation();
            });

            newspaperList.appendChild(card);
        });

        // Reattach favorite toggle listeners
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
        const favoriteIcons = document.querySelectorAll('.newspaper-card-favorite i');
        
        favoriteIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent card click
                
                const newspaperName = icon.getAttribute('data-name');
                const card = icon.closest('.newspaper-card');
                
                // Toggle favorite status
                if (favorites.includes(newspaperName)) {
                    // Remove from favorites
                    favorites = favorites.filter(name => name !== newspaperName);
                    icon.classList.remove('fa-heart');
                    icon.classList.add('fa-heart-broken');
                } else {
                    // Add to favorites
                    favorites.push(newspaperName);
                    icon.classList.remove('fa-heart-broken');
                    icon.classList.add('fa-heart');
                    
                    // Add a fun bounce animation when adding to favorites
                    icon.style.animation = 'none';
                    void icon.offsetWidth; // Trigger reflow
                    icon.style.animation = 'pulse 0.5s ease';
                }
                
                // Save to local storage
                localStorage.setItem('favoriteNewspapers', JSON.stringify(favorites));
                
                // Optional: Provide visual feedback
                card.classList.toggle('is-favorite');
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

    // Function to dynamically generate language drawer items
    function generateLanguageDrawerItems() {
        const languageContainer = document.querySelector('.language-drawer-container');
        
        // Extract unique languages from newspapers
        const uniqueLanguages = [...new Set(newspapers.map(newspaper => newspaper.language))];
        
        // Sort languages alphabetically
        uniqueLanguages.sort();
        
        // Clear existing language items
        languageContainer.innerHTML = '';
        
        // Create drawer items for each unique language
        uniqueLanguages.forEach(language => {
            const languageItem = document.createElement('div');
            languageItem.classList.add('drawer-item', 'language-item');
            languageItem.dataset.tab = `language-${language.toLowerCase()}`;
            
            const languageIcon = document.createElement('i');
            languageIcon.classList.add('language-icon');
            
            const languageText = document.createElement('span');
            languageText.textContent = language;
            
            languageItem.appendChild(languageIcon);
            languageItem.appendChild(languageText);
            
            languageContainer.appendChild(languageItem);
        });
        
        // Re-attach event listeners to new drawer items
        const newDrawerItems = document.querySelectorAll('.language-item');
        newDrawerItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all drawer items
                drawerItems.forEach(drawerItem => drawerItem.classList.remove('active'));
                item.classList.add('active');

                const tab = item.dataset.tab;
                const language = tab.split('-')[1];
                
                settingsSection.style.display = 'none';
                newspaperList.style.display = 'grid';
                displayNewspapers(newspapers.filter(newspaper => 
                    newspaper.language.toLowerCase() === language.toLowerCase()
                ));
                
                // Close drawer after selection
                closeDrawer();
            });
        });
    }

    // Initial load
    fetchNewspapers();
});
