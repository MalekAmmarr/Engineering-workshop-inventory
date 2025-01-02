document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page refresh

    // Get form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const messageContainer = document.getElementById('message');

    try {
        // Send POST request to login API
        const response = await fetch('/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Save the token to localStorage
            localStorage.setItem('token', data.token);

            // Display success message
            messageContainer.innerHTML = `
                <div class="alert alert-success" role="alert">
                    Login successful! Redirecting...
                </div>
            `;

            // Redirect to the appropriate page based on the role
            setTimeout(() => {
                window.location.href = data.redirect; // Redirect based on the `redirect` field in the response
            }, 2000);
        } else {
            messageContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Error: ${data.error || 'Unable to login.'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error logging in:', error);
        messageContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                An unexpected error occurred. Please try again later.
            </div>
        `;
    }
});
