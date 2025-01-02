document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page refresh
  
    // Get form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
  
    // Message container
    const messageContainer = document.getElementById('message');
  
    try {
      // Send POST request to backend
      const response = await fetch('/api/v1/users/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Display success message
        messageContainer.innerHTML = `
          <div class="alert alert-success" role="alert">
            User registered successfully! Redirecting to login...
          </div>
        `;
  
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = '../Public/login.html';
        }, 1000);
      } else {
        // Display error message
        messageContainer.innerHTML = `
          <div class="alert alert-danger" role="alert">
            Error: ${data.error || 'Unable to register user. Please try again.'}
          </div>
        `;
      }
    } catch (error) {
      console.error('Error:', error);
  
      // Display network error message
      messageContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          An unexpected error occurred. Please try again later.
        </div>
      `;
    }
  });
  