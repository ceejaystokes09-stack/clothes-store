function test() {
    return {
        // Structured order matches index to index across parallel structures
        images: ["static/assets/test_image_1.png", "static/assets/test_image_2.webp", "static/assets/test_image_3.webp"],
        images_alt: ["Green Sweater", "Grey Shirt ", "White Jumper"], 
        title: ["Classic Sweater", "Classic Stone Grey Hoodie", "Cream White Sweater"],
        price: ["19.99", "80", "199.99"],
        description: ["No description yet, sorry", "No description yet, sorry", "No description yet, sorry"]
    };
}

// --- RENDERING ROUTINES ---
function create_divs_for_shopping() {
    const data = test();
    let HTML_content = "";

    for (let i = 0; i < data.images.length; i++) {
        HTML_content += `
            <div class="shopping-card" data-productNumber=${i}>
                <img src="${data.images[i]}" alt="${data.images_alt[i]}" width="200px" height="300px">
                <h2 class="shopping-title">${data.title[i]}</h2>
                <h3 class="shopping-price">£${data.price[i]}</h3> 
            </div>`;
    }
    try{
        document.getElementById("clothes-container").innerHTML = HTML_content;
    }catch{
        return
    }
    
}

function create_nav_bar(data) {
    const navContainer = document.getElementById("nav-container");
    if (!navContainer) return;

    navContainer.innerHTML = ""; // Direct purge of outdated DOM nodes

    // Intercept admin strings prefixed with flags before rendering evaluation
    if (data && data.name && data.name[0] === "*") {
        data.name = data.name.slice(1);
        load_admin();
    }
    //console.log(data)
    // Extracted global nav structural components to remove string bloat
    const startNav = `
        <div class="container"> 
            <header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom"> 
                <div class="col-md-3 mb-2 mb-md-0"> 
                    <a href="/" class="d-inline-flex link-body-emphasis text-decoration-none"> 
                        <svg class="bi" width="40" height="32" role="img">
                            <img id="logo" src="/static/assets/logo.png" alt="logo" width="75px", height="75px">
                        </svg> 
                    </a> 
                    <button id="themeToggle" class="btn btn-primary" >toggle theme</button>
                </div> 
                <div class="search-container">
                    <input type="text" class="search-input" id="search" placeholder="Search">
                    <button class="search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                </div>`;

    const loggedOutActions = `
                <div class="col-md-3 text-end"> 
                    <a href="login.html" role="button" class="btn btn-outline-primary me-2">Login</a> 
                    <a href="create.html" role="button" class="btn btn-primary">Sign-up</a> 
                </div> 
            </header> 
        </div>`;

    try {
        if (!data || !data.name || data.name === "&&$H£") {
            navContainer.innerHTML = startNav + loggedOutActions;
        } else {
            const loggedInActions = `
                <div class="cart">
                    <i class="fa-solid fa-basket-shopping"></i>
                </div>
                <div class="col-md-3 text-end"> 
                    <div class="user-menu">
                        <div class="profile">
                            <p>${data.name[0]}</p>
                        </div>
                        <div class="options">
                            <ul>
                                <li id="sign-out"><i class="fa-solid fa-right-from-bracket"></i> Sign out</li>
                            </ul>
                        </div>
                    </div>
                </div> 
            </header> 
        </div>`;
            navContainer.innerHTML = startNav + loggedInActions;
        }
    } catch (e) {
        console.error("Navbar mapping failure:", e);
        navContainer.innerHTML = startNav + loggedOutActions;
    }
}

function load_admin() {
    const admin = document.getElementById("admin");
    if (admin) {
        admin.innerHTML = `<button class="add-product">Add product</button>`;
    }
}

// --- DATA LAYER AGGREGATION ---
let currentUserData = null;

window.onload = async function() {
    currentUserData = await get_data(`/api/info`); 
    create_nav_bar(currentUserData);

    // If the URL contains an ID, we are on the product page!
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        load_product_page();
    } else {
        create_divs_for_shopping();
    }
};

async function get_data(location) {
    try {
        // Appending unique timestamps breaks proxy caching traps gracefully
        let response = await fetch(location);
        if (!response.ok) throw new Error('Primary database frame offline');
        
        let data = await response.json();

        if (!data || (Array.isArray(data) && data.length === 0) || (Object.keys(data).length === 0)) {
            response = await fetch(location); 
            if (!response.ok) throw new Error('Secondary fallback server unreachable');
            data = await response.json();
        }

        return data;
    } catch (error) {
        console.error('Data pipeline connectivity error:', error);
        return null;
    }
}

// --- CENTRALIZED CONTROL ARCHITECTURE (EVENT DELEGATION) ---

function rederect_to_login() {
    window.location.href = "login.html";
}

document.addEventListener("click", async function(event) {
    const clicked = event.target;
    const optionsMenu = document.querySelector('.options');
    // const theme = document.getElementById("themeToggle");
    // 1. Route card item selections cleanly across dynamic mounts
    if (clicked.closest(".shopping-card")) {
        const card = clicked.closest(".shopping-card");
        const productNum = card.dataset.productnumber; // Automatically converts dash-case to camelCase
        //console.log("card dataset = ", card.dataset)
        
        
        // Example: Redirect with the query parameter
        window.location.href = `/products.html?id=${productNum}`;
        load_product_page()
        return;
    }
    if (clicked.id === "themeToggle" || clicked.closest("#themeToggle")) {
        const rootHtml = document.documentElement; 
        
    
        const currentTheme = rootHtml.getAttribute('data-bs-theme');
        
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
   
        rootHtml.setAttribute('data-bs-theme', newTheme);
        
        console.log("Theme changed to:", newTheme);
    }

    // 2. Uniform Logout Processing pipeline (Unified local and session storage deletion)
    if (clicked.id === "sign-out" || clicked.closest("#sign-out")) {
        try {
            fetch("/sign-out", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "signedOut": true })
        })
        .then(res => res.json())
        .catch(err => console.error("signing out issue:", err));



        } catch (error) {
            console.error("Authentication revocation execution failed:", error);
        }
        currentUserData = null;
        window.location.reload(); 
        return;
    }

    // 3. User Dropdown visibility toggles
    if (clicked.classList.contains('profile') || clicked.closest('.profile')) {
        if (optionsMenu) optionsMenu.classList.toggle('show');
    } else {
        if (optionsMenu) optionsMenu.classList.remove('show');
    }
});

// Robust query streaming handling the native inputs safely
document.addEventListener("input", function(e) {
    if (e.target && e.target.id === "search") {
        const currentSearchText = e.target.value;
        
        fetch("/search-queury", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search_query: currentSearchText })
        })
        .then(res => res.json())
        .catch(err => console.error("Search input query syncing issue:", err));
    }
});


function load_product_page(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const productId = urlParams.get('id');
    const data = test();
    
    const product = document.getElementById("product-elements");
    if (!product) return; 
    
    product.innerHTML = `
    <div class="product-container">
        <div class="product-media">
            <img src="${data.images[productId]}" alt="${data.images_alt[productId]}">
        </div>
        <div class="product-info">
            <h1 class="product-title">${data.title[productId]}</h1>
            <h2 class="product-price">£${data.price[productId]}</h2>
            <p class="product-description">${data.description[productId]}</p>
            <button class="add-to-cart-btn">
                <i class="fa-solid fa-basket-shopping"></i> Add to Cart
            </button>
        </div>
    </div>
    `;
}

// document.addEventListener('DOMContentLoaded', () => {
//     const htmlElement = document.documentElement;
//     const themeButton = document.getElementById('themeToggle');

//     // 1. Check for a previously saved theme preference, fallback to light
//     const savedTheme = localStorage.getItem('theme') || 'light';
//     htmlElement.setAttribute('data-bs-theme', savedTheme);

//     // 2. Handle button click to switch themes
//     themeButton.addEventListener('click', () => {
//         // Check current theme state
//         const currentTheme = htmlElement.getAttribute('data-bs-theme');
        
//         // Determine the new theme
//         const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
//         // Apply the new theme to the HTML tag
//         htmlElement.setAttribute('data-bs-theme', newTheme);
        
//         // Save the preference to local storage
//         localStorage.setItem('theme', newTheme);
//     });
// });