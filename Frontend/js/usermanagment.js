// Helper function to validate token and redirect if invalid
const validateToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Unauthorized: Missing or invalid token. Redirecting to the login page.');
        localStorage.removeItem('token'); // Clear the token (if any)
        window.location.href = '/public/login.html'; // Redirect to login page
        throw new Error('Unauthorized: Missing or invalid token.');
    }
    return token;
};

// Fetch and display all users
const fetchUsers = async () => {
    try {
        const token = validateToken(); // Validate token before making the request
        const response = await fetch('/api/v1/users/view', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            const usersTable = document.getElementById('usersTable');
            usersTable.innerHTML = ''; // Clear existing rows

            if (data.users.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="5" class="text-center">No users found.</td></tr>';
                return;
            }

            // Populate table rows
            data.users.forEach((user) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.user_id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${new Date(user.created_at).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="showUpdateModal('${user.user_id}', '${user.username}', '${user.role}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.user_id}')">Delete</button>
                    </td>
                `;
                usersTable.appendChild(row);
            });
        } else {
            alert(`Error fetching users: ${data.error}`);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('An error occurred while fetching users.');
    }
};

// Show the Update User Modal
const showUpdateModal = (userId, currentUsername, currentRole) => {
    if (!userId) {
        alert('User ID is missing.');
        return;
    }
    document.getElementById('updateUsername').value = currentUsername;
    document.getElementById('updateRole').value = currentRole;
    document.getElementById('updateUserId').value = userId; // Store userId in hidden input
    const updateModal = new bootstrap.Modal(document.getElementById('updateUserModal'));
    updateModal.show();
};

// Update User
const updateUser = async () => {
    try {
        const userId = document.getElementById('updateUserId').value; // Retrieve userId from hidden input
        const username = document.getElementById('updateUsername').value.trim();
        const role = document.getElementById('updateRole').value;

        if (!userId) {
            alert('No user selected for update.');
            return;
        }

        if (!username && !role) {
            alert('Please provide at least one field to update.');
            return;
        }

        const token = validateToken(); // Validate token before making the request

        const response = await fetch(`/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username, role }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            fetchUsers(); // Refresh the user list
            bootstrap.Modal.getInstance(document.getElementById('updateUserModal')).hide();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('An error occurred while updating the user.');
    }
};

// Delete User
const deleteUser = async (userId) => {
    try {
        const confirmation = confirm('Are you sure you want to delete this user?');
        if (!confirmation) return;

        const token = validateToken(); // Validate token before making the request

        const response = await fetch(`/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            fetchUsers(); // Refresh the user list
        } else {
            const error = await response.text();
            alert(`Error deleting user: ${error}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user.');
    }
};

// Fetch and display all ratings
const fetchRatings = async () => {
    try {
        const token = validateToken(); // Validate token before making the request
        const response = await fetch('/api/v1/ratings/view', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            const ratingsTable = document.getElementById('ratingsTable');
            ratingsTable.innerHTML = ''; // Clear existing rows

            if (data.ratings.length === 0) {
                ratingsTable.innerHTML = '<tr><td colspan="6" class="text-center">No ratings found.</td></tr>';
                return;
            }

            // Populate table rows
            data.ratings.forEach((rating) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rating.rating_id}</td>
                    <td>${rating.username}</td>
                    <td>${rating.equipment_name}</td>
                    <td>${rating.score}</td>
                    <td>${rating.comment || 'No comment'}</td>
                `;
                ratingsTable.appendChild(row);
            });
        } else {
            alert(`Error fetching ratings: ${data.error}`);
        }
    } catch (error) {
        console.error('Error fetching ratings:', error);
        alert('An error occurred while fetching ratings.');
    }
};

// Load users and ratings on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    fetchRatings();
});
