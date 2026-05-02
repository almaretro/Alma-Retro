// ===================================
// Alma Retrô - Novo JavaScript 2024
// Modal, Reservas, Favoritos, Menu
// ===================================

// Store products data
let productsData = [];
let currentProduct = null;

// WhatsApp Number - ALTERE AQUI PARA SEU NÚMERO
const WHATSAPP_NUMBER = '5517996421322';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    fetchProducts();
    setupMobileMenu();
    setupSearchToggle();
    setupModalListeners();
    setupProductCardListeners();
    setupFavoriteButtons();
    setupSmoothScroll();
    setupThemeToggle();
});

// ===================================
// Mobile Menu Toggle
// ===================================
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMobile = document.getElementById('navMobile');

    if (menuToggle && navMobile) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('active');
            navMobile.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const links = navMobile.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                navMobile.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!menuToggle.contains(event.target) && !navMobile.contains(event.target)) {
                menuToggle.classList.remove('active');
                navMobile.classList.remove('active');
            }
        });
    }
}

// ===================================
// Search Toggle
// ===================================
function setupSearchToggle() {
    const searchToggle = document.getElementById('searchToggle');
    const searchBar = document.getElementById('searchBar');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', function () {
            searchBar.classList.toggle('active');
            if (searchBar.classList.contains('active') && searchInput) {
                searchInput.focus();
            }
        });

        if (searchClose) {
            searchClose.addEventListener('click', function () {
                searchBar.classList.remove('active');
            });
        }

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', function (e) {
                const searchTerm = e.target.value.toLowerCase().trim();
                filterProducts(searchTerm);
            });

            searchInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    searchBar.classList.remove('active');
                }
            });
        }
    }
}

function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const matches = productName.includes(searchTerm);

        if (matches || searchTerm === '') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===================================
// Fetch Products from API
// ===================================
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        productsData = await response.json();
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

// ===================================
// Modal Functionality
// ===================================
const modal = document.getElementById('product-modal');
const closeModalBtn = document.querySelector('.close-modal');

function setupModalListeners() {
    // Close button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModalHandler);
    }

    // Close when clicking outside
    if (modal) {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeModalHandler();
            }
        });
    }

    // Close with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModalHandler();
        }
    });

    // Reserve button
    const reserveBtn = document.getElementById('modal-reserve');
    if (reserveBtn) {
        reserveBtn.addEventListener('click', handleReserve);
    }

    // Modal favorite button
    const modalFavorite = document.getElementById('modalFavorite');
    if (modalFavorite) {
        modalFavorite.addEventListener('click', function () {
            this.classList.toggle('active');
            if (currentProduct) {
                toggleFavorite(currentProduct.id);
            }
        });
    }
}

function closeModalHandler() {
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function setupProductCardListeners() {
    // Make entire product card clickable
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('click', function (event) {
            // Don't open modal if clicking favorite button
            if (event.target.closest('.favorite-btn')) {
                return;
            }

            const productId = this.getAttribute('data-product-id');
            openProductModal(productId);
        });
    });

    // Featured product card
    const featuredCard = document.querySelector('.featured-card');
    if (featuredCard) {
        featuredCard.addEventListener('click', function (event) {
            // Don't open modal if clicking favorite or reserve button
            if (event.target.closest('.featured-favorite') || event.target.closest('.btn-reserve-featured')) {
                return;
            }

            const productId = this.getAttribute('data-product-id');
            openProductModal(productId);
        });

        // Featured favorite button
        const featuredFavorite = featuredCard.querySelector('.featured-favorite');
        if (featuredFavorite) {
            featuredFavorite.addEventListener('click', function (event) {
                event.stopPropagation();
                this.classList.toggle('active');
                const productId = this.getAttribute('data-product-id');
                if (this.classList.contains('active')) {
                    addFavorite(productId);
                } else {
                    removeFavorite(productId);
                }
            });
        }

        // Featured reserve button
        const featuredReserve = featuredCard.querySelector('.btn-reserve-featured');
        if (featuredReserve) {
            featuredReserve.addEventListener('click', function (event) {
                event.stopPropagation();
                const productId = featuredCard.getAttribute('data-product-id');
                openProductModal(productId);
            });
        }
    }
}

// Open product modal
async function openProductModal(productId) {
    const product = findProduct(productId);

    if (!product) {
        console.error('Produto não encontrado:', productId);
        return;
    }

    currentProduct = product;

    // Populate modal with product data
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalSize = document.getElementById('modal-size');
    const modalThumbnails = document.getElementById('modal-thumbnails');

    // Handle images (support for multiple images)
    let images = [];
    if (product.images) {
        // Parse if it's a string, otherwise use as array
        if (typeof product.images === 'string') {
            try {
                images = JSON.parse(product.images);
            } catch (e) {
                images = [product.images];
            }
        } else {
            images = product.images;
        }
    }

    // Fallback to image_url if no images
    if (!images || images.length === 0) {
        images = [product.image_url];
    }

    if (modalImage) {
        modalImage.src = images[0];
        modalImage.alt = product.name;
        modalImage.dataset.currentIndex = 0;
    }

    // Generate thumbnails
    if (modalThumbnails && images.length > 1) {
        modalThumbnails.innerHTML = '';
        images.forEach((img, index) => {
            const thumb = document.createElement('div');
            thumb.className = `modal-thumbnail ${index === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${img}" alt="Thumbnail ${index + 1}">`;
            thumb.addEventListener('click', () => {
                // Update main image
                if (modalImage) {
                    modalImage.src = img;
                    modalImage.dataset.currentIndex = index;
                }
                // Update active thumbnail
                document.querySelectorAll('.modal-thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
            modalThumbnails.appendChild(thumb);
        });
    } else if (modalThumbnails) {
        modalThumbnails.innerHTML = '';
    }

    if (modalName) modalName.textContent = product.name;
    if (modalPrice) modalPrice.textContent = `R$ ${formatPrice(product.price)}`;
    if (modalDescription) modalDescription.textContent = product.description || 'Peça selecionada com curadoria especial. Higienizada e pronta para uso.';
    if (modalSize) modalSize.textContent = product.size ? `tamanho: ${product.size}` : 'tamanho único';

    // Check if product is favorited
    const modalFavorite = document.getElementById('modalFavorite');
    if (modalFavorite) {
        const favorites = getFavorites();
        if (favorites.includes(product.id.toString())) {
            modalFavorite.classList.add('active');
        } else {
            modalFavorite.classList.remove('active');
        }
    }

    // Show modal
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ===================================
// Reserve Functionality
// ===================================
function handleReserve() {
    if (!currentProduct) return;

    const product = currentProduct;

    // Build WhatsApp message
    const message = encodeURIComponent(
        `Olá! Gostaria de reservar a seguinte peça:\n\n` +
        `*${product.name}*\n` +
        `R$ ${formatPrice(product.price)}\n` +
        `Tamanho: ${product.size || 'único'}\n\n` +
        `Aguardo confirmação da disponibilidade.`
    );

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Close modal
    closeModalHandler();
}

// ===================================
// Favorites System (LocalStorage)
// ===================================
function setupFavoriteButtons() {
    // Use event delegation for favorite buttons
    document.addEventListener('click', function (event) {
        const favoriteBtn = event.target.closest('.favorite-btn');
        if (favoriteBtn) {
            event.stopPropagation();
            const productId = favoriteBtn.getAttribute('data-product-id');
            const isActive = favoriteBtn.classList.toggle('active');

            if (isActive) {
                addFavorite(productId);
            } else {
                removeFavorite(productId);
            }
        }

        // Handle reserve buttons
        const reserveBtn = event.target.closest('.btn-reserve-product, .btn-reserve-featured');
        if (reserveBtn) {
            event.stopPropagation();
            const productId = reserveBtn.getAttribute('data-product-id');
            if (productId) {
                const product = productsData.find(p => p.id == productId);
                if (product) {
                    reserveProduct(product);
                }
            }
        }
    });

    // Restore favorite states
    restoreFavoriteStates();
}

function getFavorites() {
    return JSON.parse(localStorage.getItem('alma_retro_favorites') || '[]');
}

function addFavorite(productId) {
    const favorites = getFavorites();
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem('alma_retro_favorites', JSON.stringify(favorites));
    }
}

function removeFavorite(productId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('alma_retro_favorites', JSON.stringify(favorites));
    }
}

function toggleFavorite(productId) {
    const favorites = getFavorites();
    if (favorites.includes(productId.toString())) {
        removeFavorite(productId.toString());
    } else {
        addFavorite(productId.toString());
    }
    restoreFavoriteStates();
}

function restoreFavoriteStates() {
    const favorites = getFavorites();

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        if (favorites.includes(productId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ===================================
// Product Helpers
// ===================================
function findProduct(productId) {
    let product = productsData.find(p => p.id == productId);

    if (!product) {
        // Try to get from DOM data
        const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (card) {
            const name = card.querySelector('.product-name')?.textContent;
            const priceText = card.querySelector('.product-price')?.textContent;
            const img = card.querySelector('.product-image img');

            if (name && priceText) {
                const price = parseFloat(priceText.replace('R$', '').replace(',', '.').trim());
                product = {
                    id: productId,
                    name: name,
                    price: price,
                    image_url: img?.src || '',
                    description: '',
                    size: ''
                };
            }
        }
    }

    return product;
}

async function fetchProductFromAPI(productId) {
    try {
        const response = await fetch(`/api/product/${productId}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return null;
    }
}

// ===================================
// Utility Functions
// ===================================
function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
}

function sanitize(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Image loading
function setupImageLoading() {
    document.querySelectorAll('.product-image img').forEach(img => {
        img.addEventListener('load', function () {
            this.classList.add('loaded');
        });

        img.addEventListener('error', function () {
            this.style.display = 'none';
        });
    });
}

// Initialize image loading
document.addEventListener('DOMContentLoaded', function () {
    setupImageLoading();
});

// ===================================
// Theme Toggle (Dark/Light Mode)
// ===================================
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}
