// Default mock data to populate admin dashboard
const defaultProducts = [
    {
        id: "p1",
        name: "Geometric Motif 4-Door Wardrobe",
        category: "cupboard",
        price: "Starting ₹32,000",
        image: "images/geometric-motif-wardrobe.png"
    },
    {
        id: "p2",
        name: "Matte Black & Wood Geometric Bed Combo",
        category: "bed cupboard",
        price: "Starting ₹37,000",
        image: "images/black-wood-bed-combo.png"
    },
    {
        id: "p3",
        name: "Slatted Wood TV Unit",
        category: "tv-unit",
        price: "Starting ₹22,000",
        image: "images/slatted-wood-tv-unit.jpg"
    },
    {
        id: "p4",
        name: "Diamond Tufted Bed",
        category: "bed",
        price: "Starting ₹18,000",
        image: "images/diamond-tufted-bed.png"
    }
];

// Initialize localStorage if empty
if (!localStorage.getItem('shreeMadhavProducts')) {
    localStorage.setItem('shreeMadhavProducts', JSON.stringify(defaultProducts));
}

let products = JSON.parse(localStorage.getItem('shreeMadhavProducts'));

// DOM Elements
const tbody = document.getElementById('productTableBody');
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');
const totalProductsCard = document.getElementById('totalProductsCard');

// Render products table
function renderTable() {
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        
        // Formulate readable category
        let catDisplay = product.category;
        if(catDisplay === 'bed cupboard') catDisplay = 'Bed & Cupboard Combo';
        else catDisplay = catDisplay.charAt(0).toUpperCase() + catDisplay.slice(1).replace('-', ' ');

        tr.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" onerror="this.src='images/logo.png'"></td>
            <td style="font-weight: 500; color: var(--primary);">${product.name}</td>
            <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${catDisplay}</span></td>
            <td>${product.price}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalProductsCard.textContent = products.length;
}

// Modal functions
function openModal(id = null) {
    if (id) {
        // Edit mode
        const p = products.find(prod => prod.id === id);
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = p.id;
        document.getElementById('productName').value = p.name;
        document.getElementById('productCategory').value = p.category;
        document.getElementById('productPrice').value = p.price;
        document.getElementById('productImage').value = p.image;
    } else {
        // Add mode
        document.getElementById('modalTitle').textContent = 'Add New Product';
        form.reset();
        document.getElementById('productId').value = '';
    }
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

// Form submit handler (Create / Update)
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = document.getElementById('productPrice').value;
    const image = document.getElementById('productImage').value;

    if (id) {
        // Update existing
        const index = products.findIndex(p => p.id === id);
        if (index > -1) {
            products[index] = { id, name, category, price, image };
        }
    } else {
        // Create new
        const newId = 'p' + Date.now();
        products.push({ id: newId, name, category, price, image });
    }

    // Save & re-render
    localStorage.setItem('shreeMadhavProducts', JSON.stringify(products));
    renderTable();
    closeModal();
});

// Delete handler
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('shreeMadhavProducts', JSON.stringify(products));
        renderTable();
    }
}

// Initial render
renderTable();
