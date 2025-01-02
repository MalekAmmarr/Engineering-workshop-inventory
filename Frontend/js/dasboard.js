// Fetch and populate equipment data
// Fetch and populate equipment data
const loadEquipment = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not authenticated. Please log in.');
            window.location.href = '../public/login.html';
            return;
        }

        const response = await fetch('/api/v1/equipment', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();

        if (response.ok) {
            const equipmentTable = document.getElementById('equipmentTable');
            const categoryFilter = document.getElementById('categoryFilter');
            const statusFilter = document.getElementById('statusFilter');
            const supplierFilter = document.getElementById('supplierFilter');
            const nameFilter = document.getElementById('nameFilter');

            equipmentTable.innerHTML = ''; // Clear existing rows

            // Populate filters dynamically
            const categories = new Set();
            const statuses = new Set();
            const suppliers = new Set();

            data.equipment.forEach((item) => {
                categories.add(item.category_name);
                statuses.add(item.status);
                suppliers.add(item.supplier_name);

                const isOutOfStock = item.quantity === 0;

                // Handle image URL logic (same as in fetchEquipment)
                const imageUrl = item.equipment_img ? `${item.equipment_img}?t=${Date.now()}` : '/images/default.png';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <img 
                            src="${imageUrl}" 
                            alt="${item.equipment_name}" 
                            style="width: 80px; height: 80px; object-fit: cover;"
                        >
                    </td>
                    <td>${item.equipment_name}</td>
                    <td>${item.category_name}</td>
                    <td>${item.supplier_name}</td>
                    <td>${item.rating}</td>
                    <td>${item.model_number}</td>
                    <td>${item.quantity}</td>
                    <td>${isOutOfStock ? 'Out of Stock' : 'Available'}</td>
                    <td>
                        ${!isOutOfStock
                            ? `<button class="btn btn-success btn-sm" onclick="addToCart(${item.equipment_id})">Add to Cart</button>`
                            : '<span class="text-muted">Unavailable</span>'}
                    </td>
                `;
                equipmentTable.appendChild(row);
            });

            // Populate filters
            populateFilterOptions(categoryFilter, categories, 'All Categories');
            populateFilterOptions(statusFilter, statuses, 'All Status');
            populateFilterOptions(supplierFilter, suppliers, 'All Suppliers');

            // Attach filter event listeners
            nameFilter.addEventListener('input', filterEquipment);
            categoryFilter.addEventListener('change', filterEquipment);
            statusFilter.addEventListener('change', filterEquipment);
            supplierFilter.addEventListener('change', filterEquipment);
        } else {
            alert(`Failed to load equipment: ${data.error}`);
        }
    } catch (error) {
        console.error('Error fetching equipment:', error);
        alert('An error occurred while fetching the equipment.');
    }
};



// Helper function to populate filter options dynamically
const populateFilterOptions = (filterElement, items, defaultOption) => {
    filterElement.innerHTML = `<option value="">${defaultOption}</option>`;
    items.forEach((item) => {
        filterElement.innerHTML += `<option value="${item}">${item}</option>`;
    });
};

// Filter equipment dynamically
const filterEquipment = () => {
    const nameFilter = document.getElementById('nameFilter').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const supplierFilter = document.getElementById('supplierFilter').value;

    const equipmentTable = document.getElementById('equipmentTable');
    const rows = equipmentTable.getElementsByTagName('tr');

    Array.from(rows).forEach((row) => {
        const cells = row.getElementsByTagName('td');
        if (cells.length === 0) return; // Skip empty rows (e.g., headers)

        // Extracting values from cells for filtering
        const name = cells[1]?.textContent.toLowerCase() || ''; // Name column (1st column)
        const category = cells[2]?.textContent || ''; // Category column (2nd column)
        const supplier = cells[3]?.textContent || ''; // Supplier column (3rd column)
        const status = cells[7]?.textContent || ''; // Status column (7th column)

        const matchesName = name.includes(nameFilter);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesSupplier = !supplierFilter || supplier === supplierFilter;

        // Display or hide row based on filters
        row.style.display = matchesName && matchesCategory && matchesStatus && matchesSupplier ? '' : 'none';
    });
};

// Add equipment to cart
const addToCart = async (equipmentId) => {
    try {
        const quantity = 1; // Default quantity to add
        const response = await fetch('/api/v1/cart/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ equipment_id: equipmentId, quantity }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Added to cart successfully.');

            // Update the equipment table to reflect changes dynamically
            await loadEquipment();
        } else {
            alert(`Error adding to cart: ${data.error}`);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('An error occurred while adding to the cart.');
    }
};




// View cart items
const viewCart = async () => {
    try {
        const response = await fetch('/api/v1/cart/view', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            const cartItems = document.getElementById('cartItems');
            cartItems.innerHTML = '';

            if (data.cart.length === 0) {
                cartItems.innerHTML = '<li class="list-group-item">Your cart is empty.</li>';
            } else {
                data.cart.forEach((item) => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                    listItem.innerHTML = `
                        <div>
                            <strong>${item.equipment_name}</strong><br>
                            Model Number: ${item.model_number}<br>
                            Quantity: ${item.quantity}<br>
                            Supplier: ${item.supplier_name}<br>
                            Status: ${item.status}<br>
                            Rating: ${item.rating}
                        </div>
                        <div>
                            <button 
                                class="btn btn-danger btn-sm" 
                                onclick="removeItemFromCart('${item.model_number}')">
                                Remove Item
                            </button>
                        </div>
                    `;
                    cartItems.appendChild(listItem);
                });
            }

            // Use Bootstrap's modal API to toggle the modal
            const modalElement = document.getElementById('cartModal');
            const cartModal = bootstrap.Modal.getOrCreateInstance(modalElement); // Reuse or create modal instance
            cartModal.show();
        } else {
            alert(`Error fetching cart: ${data.error}`);
        }
    } catch (error) {
        console.error('Error viewing cart:', error);
        alert('An error occurred while viewing the cart.');
    }
};
const viewOrders = async () => {
    try {
        const response = await fetch('/api/v1/orders/view', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            const ordersModal = document.getElementById('ordersModalContent');
            ordersModal.innerHTML = ''; // Clear existing content

            if (data.orders.length === 0) {
                ordersModal.innerHTML = '<p>You have no orders yet.</p>';
            } else {
                data.orders.forEach((order) => {
                    const orderElement = document.createElement('div');
                    orderElement.className = 'order-item';
                    orderElement.innerHTML = `
                        <h5>Order ID: ${order.order_id}</h5>
                        <p>Date: ${order.date}</p>
                        <ul>
                            ${order.items.map(item => `
                                <li>
                                    ${item.equipment_name} - Quantity: ${item.quantity}
                                    <button 
                                        class="btn btn-sm btn-primary" 
                                        onclick="rateProduct(${item.equipment_id}, this)"
                                        ${item.user_rating ? 'disabled' : ''}>
                                        ${item.user_rating ? 'Rated' : 'Rate'}
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                    ordersModal.appendChild(orderElement);
                });
            }

            // Show the modal
            const ordersModalInstance = new bootstrap.Modal(document.getElementById('ordersModal'));
            ordersModalInstance.show();
        } else {
            alert(`Error fetching orders: ${data.error}`);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('An error occurred while fetching orders.');
    }
};


let currentEquipmentId = null; // Store the equipment ID for rating
let currentRatingButton = null; // Store the current rating button for disabling after submission

// Function to open the rating modal and set the equipment ID
const rateProduct = (equipmentId, buttonElement) => {
    currentEquipmentId = equipmentId; // Set the equipment ID
    currentRatingButton = buttonElement; // Store the button element
    const ratingModalInstance = new bootstrap.Modal(document.getElementById('ratingModal'));
    ratingModalInstance.show();
};

// Function to submit the rating
const submitRating = async (event) => {
    event.preventDefault(); // Prevent form submission from reloading the page
    try {
        const score = document.getElementById('ratingScore').value;
        const comment = document.getElementById('ratingComment').value;

        const response = await fetch('/api/v1/rating/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ equipment_id: currentEquipmentId, score, comment }),
        });

        const data = await response.json();
        if (response.ok) {
            // Success message
            alert('Rating submitted successfully!');
            
            // Disable the rating button for this product
            if (currentRatingButton) {
                currentRatingButton.disabled = true;
                currentRatingButton.textContent = 'Rated';
            }

            // Close the rating modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('ratingModal'));
            modal.hide();

            // Reset the form
            document.getElementById('ratingForm').reset();
        } else {
            alert(`Error submitting rating: ${data.error}`);
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('An error occurred while submitting the rating.');
    }
};



const removeItemFromCart = async (modelNumber) => {
    try {
        const response = await fetch('/api/v1/cart/remove-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ model_number: modelNumber }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);

            // Refresh both the cart and equipment list
            await loadEquipment();
            await viewCart();
        } else {
            alert(`Error removing item: ${data.error}`);
        }
    } catch (error) {
        console.error('Error removing item:', error);
        alert('An error occurred while removing the item.');
    }
};


const placeOrder = async () => {
    try {
        const response = await fetch('/api/v1/order/new', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        const data = await response.json();
        if (response.ok) {
            alert('Order placed successfully!');
            await loadEquipment(); // Refresh the equipment list
            const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
            modal.hide(); // Hide the cart modal
        } else {
            alert(`Error placing order: ${data.error}`);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('An error occurred while placing the order.');
    }
};


// Load equipment on page load
document.addEventListener('DOMContentLoaded', loadEquipment);
