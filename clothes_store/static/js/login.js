function handleCredentialResponse(response) {
    const idToken = response.credential;
    
    fetch('/api/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: idToken })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            window.location.href = "/";
        } else {
            alert("Authentication failed: " + data.error);
        }
    })
    .catch(err => console.error("Error during authentication flow:", err));
}



function verify_account_create(){
    const form = document.getElementById("createForm");

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevents page reload
        
        // Grab the values from your input fields (ensure these IDs match your HTML)
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('pass').value;

        try {
            const response = await fetch("/create-acc", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Account created successfully! Redirect to index
                window.location.href = data.redirect;
            } else {
                // Display error message
                const errorElement = document.getElementById("error");
                errorElement.innerHTML = data.error;
                errorElement.style.display = "block";
            }
        } catch (error) {
            console.error("Network error during registration:", error);
        }
    });
}
if (window.location.href.includes("create.html")){
    verify_account_create()
}else{
    const form = document.getElementById("loginForm")

    form.addEventListener('submit', async function(event) {
        const isLoginPage = window.location.href.includes('login.html');

        if (isLoginPage) {
            event.preventDefault(); // This stops the raw text page from appearing
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('pass').value;

            try {
                const response = await fetch("/sign-in", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.status === "success") {
                    window.location.href = "/";
                } else {
                    const error = document.getElementById("error");
                    error.innerHTML = data.error;
                    error.style.display = "block";
                }
            } catch (error) {
                console.error("Network error:", error);
            }
        }
        
    });

}


async function get_data(location) {
    try {
        // Appending unique timestamps breaks proxy caching traps gracefully
        let response = await fetch(location);
        
        if (!response.ok) throw new Error('Primary database frame offline');
        console.log("not here")
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


