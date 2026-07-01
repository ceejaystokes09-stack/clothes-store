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


