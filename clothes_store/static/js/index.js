function test() {
    return {
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
let loggedIn = false; 
function create_nav_bar(data) {
    
    const navContainer = document.getElementById("nav-container");
    if (!navContainer) return;

    navContainer.innerHTML = ""; // Direct purge of outdated DOM nodes

    // Intercept admin strings prefixed with flags before rendering evaluation
    if (data && data.name && data.name[0] === "*") {
        data.name = data.name.slice(1);
        load_admin();
    }
    console.log(data)
    //console.log(data)
    // ok in this part u will see that the class names for some of them are just cart -wrapper and things to do with the cart, i did this just to save dev time
    // as i didnt need to make new css or change my bad :(
    const startNav = `
        <div class="container"> 
            <header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom"> 
                <div class="col-md-3 mb-2 mb-md-0"> 
                    <div class="tooltip-bottom">
                        <span class="tooltiptext-bottom">Home</span>
                        <a href="/" class="d-inline-flex link-body-emphasis text-decoration-none"> 

                            <svg class="bi" width="40" height="32" role="img">
                                <img id="logo" src="/static/assets/logo.png" alt="logo" width="75px", height="75px">
                                
                            </svg> 
                        </a> 
                    </div>
                    <div class="tooltip-bottom">
                        <span class="tooltiptext-bottom">Settings</span>
                    
                        <div class="settings-wrapper">
                            <button id="settings-toggle" class="btn position-relative" aria-label="Open settings">
                                <i class="fa-solid fa-gear"></i>
                            </button>

                            <div id="settings-dropdown" class="cart-dropdown-menu"> <div class="cart-header">
                                    <h5>Settings</h5>
                                    <button id="close-settings" class="btn-close" aria-label="Close settings"></button>
                                </div>
                                
                                <div class="cart-body">
                                    <button id="themeToggle" class="btn btn-primary">toggle theme</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div> 
                <div class="search-container">
                    <input type="text" class="search-input" id="search" placeholder="Search">
                    <div class="tooltip-left">
                        <span class="tooltiptext-left">Search</span>
                        <button class="search-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </div>
                </div>`;

    const loggedOutActions = `
                <div class="col-md-3 text-end"> 
                    <div class="tooltip-right">
                        <span class="tooltiptext-right">Login</span>
                        <a href="login.html" role="button" class="btn btn-outline-primary me-2">Login</a> 
                    </div>
                    <div class="tooltip-bottom">
                        <span class="tooltiptext-bottom">Sign up</span>
                        <a href="create.html" role="button" class="btn btn-primary">Sign-up</a> 
                    </div>
                </div> 
            </header> 
        </div>`;

    try {
        if (!data || !data.name || data.name === "&&$H£") {
            navContainer.innerHTML = startNav + loggedOutActions;
        } else {
            loggedIn = true; 
            const loggedInActions = `
                <div class="cart-wrapper">
                    <button id="cart-toggle" class="btn position-relative" aria-label="Open shopping cart">
                        <div class="tooltip-bottom">
                            <span class="tooltiptext-left">Cart</span>
                            <i class="fa-solid fa-basket-shopping fs-4"></i>
                            <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">0</span>
                        </div>
                    </button>

                    <div id="cart-dropdown" class="cart-dropdown-menu">
                        <div class="cart-header">
                            <h5>Your Basket</h5>
                            <button id="close-cart" class="btn-close" aria-label="Close cart"></button>
                        </div>
                        
                        <div id="cart-items" class="cart-body">
                            <p class="empty-msg">Your basket is empty.</p>
                        </div>
                        
                        <div class="cart-footer">
                            <div class="d-flex justify-content-between font-weight-bold mb-3">
                                <span>Total:</span>
                                <span id="cart-total">£0.00</span>
                            </div>
                            <button class="btn btn-primary w-100">Go to Checkout</button>
                        </div>
                    </div>
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

if (window.location.href.includes("confirm.html")){
    const form = document.getElementById("confirmForm");
    form.addEventListener("submit", async function(event){
        event.preventDefault();

        const code_data = document.getElementById("code-input").value;
        const errorElement = document.getElementById("error");
        try{
            const response = await fetch("/email-code", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: code_data  })
                });

                const data = await response.json();
                
                if (response.ok && data.status === "success") {
                    // Send the user to the validation page provided by the backend
                    window.location.href = data.redirect;
                } else {
                    if (errorElement) {
                        errorElement.innerHTML = data.error;
                        errorElement.style.display = "block";
                    }
                }
        }catch (error) {
            console.error("Forgot password workflow error:", error);
        }
    })
}
// Wrap the execution block inside an async IIFE function block
if (window.location.href.includes("forgot.html")){
    const form = document.getElementById("forgotForm");
    if (form) {
        form.addEventListener("submit", async function(event){
            event.preventDefault(); // Prevents the page from reloading
            
            // 1. Get the email value from the input field
            const emailInput = document.getElementById("email").value;
            const errorElement = document.getElementById("error");

            try {
                // 2. Send a POST request carrying the payload
                const response = await fetch("/send-code", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailInput })
                });

                const data = await response.json();

                // 3. Evaluate the backend data response status
                if (response.ok && data.status === "success") {
                    // Send the user to the validation page provided by the backend
                    window.location.href = data.redirect;
                } else {
                    // Render the email check validation error natively
                    if (errorElement) {
                        errorElement.innerHTML = data.error;
                        errorElement.style.display = "block";
                    }
                }
            } catch (error) {
                console.error("Forgot password workflow error:", error);
            }
        });
    }
}

// --- DATA LAYER AGGREGATION ---
let currentUserData = null;

window.onload = async function() {
    currentUserData = await get_data(`/api/info`); 
    create_nav_bar(currentUserData);

    // Initial check: if the server logs an existing cart array for the loggedIn session profile, map it on load
    if (currentUserData && currentUserData.cart_data) {
        render_cart_visually(currentUserData.cart_data);
    }

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


    const cartMenu = document.getElementById("cart-dropdown");
    if (clicked.id === "cart-toggle" || clicked.closest("#cart-toggle")) {
        if (cartMenu) cartMenu.classList.toggle("show");
        return;
    }
    if (clicked.id === "close-cart" || clicked.closest("#close-cart")) {
        if (cartMenu) cartMenu.classList.remove("show");
        return;
    }
    if (!clicked.closest(".cart-wrapper") && cartMenu) {
        cartMenu.classList.remove("show");
    }

    // --- 3. SETTINGS DROPDOWN CONTROLS ---
    const settingsMenu = document.getElementById("settings-dropdown");
    if (clicked.id === "settings-toggle" || clicked.closest("#settings-toggle")) {
        if (settingsMenu) settingsMenu.classList.toggle("show");
        return;
    }
    if (clicked.id === "close-settings" || clicked.closest("#close-settings")) {
        if (settingsMenu) settingsMenu.classList.remove("show");
        return;
    }
    if (!clicked.closest(".settings-wrapper") && settingsMenu) {
        settingsMenu.classList.remove("show");
    }

    if (clicked.closest(".add-to-cart-btn")){
        if (loggedIn){
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const productId = urlParams.get('id');
            
            const allProducts = test(); 
            const productPayload = {
                id: productId,
                title: allProducts.title[productId],
                price: allProducts.price[productId],
                image: allProducts.images[productId],
                alt_image: allProducts.images_alt[productId],
                quantity: 1 // First add initializes with quantity 1
            };

            // Fire off backend update
            update_cart(productPayload); 

            // SWAP THE BUTTON WITH QUANTITY CONTROLS
            const wrapper = document.getElementById("cart-controls-wrapper");
            if (wrapper) {
                wrapper.innerHTML = `
                    <div class="quantity-selector">
                        <button class="qty-btn minus-btn" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="qty-input" value="1" min="1" max="99">
                        <button class="qty-btn plus-btn" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
                    </div>
                `;

                // Setup local selectors
                const input = wrapper.querySelector(".qty-input");
                const minusBtn = wrapper.querySelector(".minus-btn");
                const plusBtn = wrapper.querySelector(".plus-btn");

                // Helper to quickly pack payload data for quantity changes
                const syncCartQuantity = (newQty) => {
                    productPayload.quantity = newQty;
                    update_cart(productPayload);
                };

                // Plus Button Clicked
                plusBtn.addEventListener("click", () => {
                    const newVal = parseInt(input.value) + 1;
                    input.value = newVal;
                    syncCartQuantity(newVal);
                });

                // Minus Button Clicked
                minusBtn.addEventListener("click", () => {
                    const currentVal = parseInt(input.value);
                    if (currentVal > 1) {
                        const newVal = currentVal - 1;
                        input.value = newVal;
                        syncCartQuantity(newVal);
                    } else {
                        // Revert back to the original Add to Cart button layout
                        wrapper.innerHTML = `
                            <button class="add-to-cart-btn">
                                <i class="fa-solid fa-basket-shopping"></i> Add to Cart
                            </button>
                        `;
                        // Send 0 to let the backend know it should be removed from arrays
                        syncCartQuantity(0);
                    }
                });

                // Manual Typing Validation
                input.addEventListener("change", () => {
                    if (input.value < 1 || isNaN(input.value)) {
                        input.value = 1;
                    }
                    syncCartQuantity(parseInt(input.value));
                });
            }
        }
        else {
            window.location.href = "login.html";
        }
    }
    if (clicked.id === "themeToggle" || clicked.closest("#themeToggle")) {
        const rootHtml = document.documentElement; 
        
    
        const currentTheme = rootHtml.getAttribute('data-bs-theme');
        
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
   
        rootHtml.setAttribute('data-bs-theme', newTheme);
        
        //console.log("Theme changed to:", newTheme);
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
    <div class="goback">
        <a href="/"><i class="fa-solid fa-arrow-left"></i> Go back</a>
    </div>
    <div class="product-container">
        
        <div class="product-media">
            <img src="${data.images[productId]}" alt="${data.images_alt[productId]}">
        </div>
        <div class="product-info">
            <h1 class="product-title">${data.title[productId]}</h1>
            <h2 class="product-price">£${data.price[productId]}</h2>
            <p class="product-description">${data.description[productId]}</p>
            <div id="cart-controls-wrapper">
                <button class="add-to-cart-btn">
                    <i class="fa-solid fa-basket-shopping"></i> Add to Cart
                </button>
            </div>
        </div>
    </div>
    `;
}

async function update_cart(id){
    try {
        const response = await fetch("/cart-data", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({data: id})
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
            // --- PASS DATA DIRECTLY TO VISUAL LAYER ---
            render_cart_visually(data.cart_data);
        }
    } catch (error) {
        console.error("Don't know anymore:", error);
    }
}

function render_cart_visually(cartData) {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCountBadge = document.getElementById("cart-count");
    const cartTotalAmount = document.getElementById("cart-total");

    if (!cartItemsContainer) return;

    // 1. Guard clause: If cartData or its key structures are missing, render empty cart
    if (!cartData || !cartData.title) {
        cartItemsContainer.innerHTML = `<p class="empty-msg">Your basket is empty.</p>`;
        if (cartCountBadge) cartCountBadge.textContent = "0";
        if (cartTotalAmount) cartTotalAmount.textContent = "£0.00";
        return;
    }

    let titles = [];
    let prices = [];
    let images = [];
    let alts = [];

    // Helper function to safely read data whether it's a JSON string OR already an Array/List
    const ensureArray = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field; // If it's already a list, use it directly!
        try {
            if (typeof field === "string") return JSON.parse(field); // If it's a string, parse it
        } catch (e) {
            console.error("Error parsing field:", e);
        }
        return [];
    };

    // 2. Safely extract your lists
    titles = ensureArray(cartData.title);
    prices = ensureArray(cartData.price);
    images = ensureArray(cartData.images || cartData.image);
    alts = ensureArray(cartData["alt-image"] || cartData.image_alt);

    // 3. Group the flat arrays into a structured map with quantities
    const groupedCart = {};

    for (let i = 0; i < titles.length; i++) {
        const itemTitle = titles[i];
        
        if (!groupedCart[itemTitle]) {
            groupedCart[itemTitle] = {
                title: itemTitle,
                price: parseFloat(prices[i]) || 0,
                image: images[i] || '',
                alt: alts[i] || '',
                quantity: 0
            };
        }
        groupedCart[itemTitle].quantity += 1;
    }

    // 4. Build the HTML and calculate totals
    let itemsHTML = "";
    let totalItemsCount = 0;
    let totalPrice = 0;

    Object.values(groupedCart).forEach(item => {
        totalItemsCount += item.quantity;
        const itemLineTotal = item.price * item.quantity;
        totalPrice += itemLineTotal;

        itemsHTML += `
            <div class="cart-item d-flex align-items-center justify-content-between mb-3">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.alt}" width="50px" height="50px" class="me-2 rounded" style="object-fit: cover;">
                    <div>
                        <h6 class="mb-0 text-truncate" style="max-width: 120px;">${item.title}</h6>
                        <small class="text-muted">£${item.price.toFixed(2)} x ${item.quantity}</small>
                    </div>
                </div>
                <span class="font-weight-bold">£${itemLineTotal.toFixed(2)}</span>
            </div>
        `;
    });

    // 5. Update DOM values or fallback to empty state
    if (totalItemsCount === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-msg">Your basket is empty.</p>`;
    } else {
        cartItemsContainer.innerHTML = itemsHTML;
    }

    if (cartCountBadge) cartCountBadge.textContent = totalItemsCount;
    if (cartTotalAmount) cartTotalAmount.textContent = `£${totalPrice.toFixed(2)}`;
}
