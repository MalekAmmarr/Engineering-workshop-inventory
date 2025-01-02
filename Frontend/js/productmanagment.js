// Helper function to validate token
const validateToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Invalid or expired token. You will be redirected to the login page.');
        window.location.href = '../public/login.html'; // Redirect to login page
        throw new Error('Invalid or expired token.');
    }
    return token;
};

// Fetch and populate equipment data
const fetchEquipment = async () => {
    try {
        const token = validateToken(); // Validate token before making the request
        const response = await fetch('/api/v1/equipment', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        const equipmentTable = document.getElementById('equipmentTable');
        equipmentTable.innerHTML = '';

        data.equipment.forEach((item) => {
            const imageUrl = item.equipment_img
                ? `${item.equipment_img}?t=${Date.now()}`
                : '/images/default.png';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.equipment_id}</td>
                <td>${item.equipment_name}</td>
                <td><img src="${imageUrl}" alt="${item.equipment_name}" style="width: 100px; height: 100px;"></td>
                <td>${item.model_number}</td>
                <td>${item.quantity}</td>
                <td>${item.status}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="showUpdateModal(${item.equipment_id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEquipment(${item.equipment_id})">Delete</button>
                </td>
            `;
            equipmentTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching equipment:', error.message);
    }
};

const addEquipment = async (event) => {
    event.preventDefault();
    try {
        const token = validateToken(); // Validate token before making the request
        const formData = new FormData();
        formData.append('equipment_name', document.getElementById('equipmentName').value);
        formData.append('equipment_img', document.getElementById('equipmentImage').files[0]);
        formData.append('model_number', document.getElementById('modelNumber').value);
        formData.append('quantity', document.getElementById('quantity').value);
        formData.append('status', document.getElementById('status').value);
        formData.append('category_name', document.getElementById('category_name').value);
        formData.append('supplier_name', document.getElementById('supplier_name').value);

        const response = await fetch('/api/v1/equipment/new', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) throw new Error(await response.text());
        alert('Equipment added successfully!');
        fetchEquipment();
        bootstrap.Modal.getInstance(document.getElementById('addEquipmentModal')).hide();
    } catch (error) {
        console.error('Error adding equipment:', error.message);
        alert(error.message); // Display error message
    }
};

const deleteEquipment = async (id) => {
    try {
        const token = validateToken(); // Validate token before making the request
        const confirmation = confirm('Are you sure you want to delete this equipment?');
        if (!confirmation) return;

        const response = await fetch(`/api/v1/equipment/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error(await response.text());
        alert('Equipment deleted successfully!');
        fetchEquipment();
    } catch (error) {
        console.error('Error deleting equipment:', error.message);
        alert(error.message); // Display error message
    }
};

const showUpdateModal = async (id) => {
    try {
        const token = validateToken(); // Validate token before making the request
        const response = await fetch(`/api/v1/equipment/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error(await response.text());

        const equipment = await response.json();
        document.getElementById('updateEquipmentId').value = equipment.equipment_id;
        document.getElementById('updateEquipmentName').value = equipment.equipment_name;
        document.getElementById('updateModelNumber').value = equipment.model_number;
        document.getElementById('updateQuantity').value = equipment.quantity;
        document.getElementById('updateStatus').value = equipment.status;

        const updateModalElement = document.getElementById('updateEquipmentModal');
        const updateModal = new bootstrap.Modal(updateModalElement);
        updateModal.show();
    } catch (error) {
        console.error('Error loading equipment details:', error.message);
        alert(error.message); // Display error message
    }
};

const updateEquipment = async (event) => {
    event.preventDefault();
    try {
        const token = validateToken(); // Validate token before making the request
        const equipmentId = document.getElementById('updateEquipmentId').value;

        const formData = {
            equipment_name: document.getElementById('updateEquipmentName').value,
            model_number: document.getElementById('updateModelNumber').value,
            quantity: document.getElementById('updateQuantity').value,
            status: document.getElementById('updateStatus').value,
        };

        const response = await fetch(`/api/v1/equipment/${equipmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error(await response.text());

        alert('Equipment updated successfully!');
        fetchEquipment();
        bootstrap.Modal.getInstance(document.getElementById('updateEquipmentModal')).hide();
    } catch (error) {
        console.error('Error updating equipment:', error.message);
        alert(error.message); // Display error message
    }
};

// Add event listeners
document.getElementById('addEquipmentForm').addEventListener('submit', addEquipment);
document.getElementById('updateEquipmentForm').addEventListener('submit', updateEquipment);

// Fetch equipment data on page load
document.addEventListener('DOMContentLoaded', fetchEquipment);
