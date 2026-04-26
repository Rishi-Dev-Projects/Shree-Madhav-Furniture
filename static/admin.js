let products = [];

// DOM Elements
const tbody = document.getElementById('productTableBody');
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

async function fetchStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();
        document.querySelector('.analytics-grid').innerHTML = `
            <div class="analytics-card">
                <h3>Total Page Views</h3>
                <div class="value">${stats.total_views}</div>
                <div style="font-size:0.8rem;color:#666;margin-top:5px;">Today: ${stats.today_views}</div>
            </div>
            <div class="analytics-card">
                <h3>WhatsApp Inquiries</h3>
                <div class="value">${stats.total_whatsapp}</div>
                <div style="font-size:0.8rem;color:#666;margin-top:5px;">Today: ${stats.today_whatsapp}</div>
            </div>
            <div class="analytics-card">
                <h3>Total Products</h3>
                <div class="value">${stats.total_products}</div>
            </div>
            <div class="analytics-card">
                <h3>Inquiry Rate</h3>
                <div class="value" style="color:var(--color-primary);">${stats.total_views > 0 ? ((stats.total_whatsapp / stats.total_views) * 100).toFixed(1) + '%' : '0%'}</div>
            </div>
        `;
    } catch (err) {
        console.error("Failed to fetch stats", err);
    }
}

async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        products = await res.json();
        renderTable();
    } catch (err) {
        console.error("Failed to fetch products", err);
    }
}

function renderTable() {
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        
        let catDisplay = product.category;
        if(catDisplay === 'bed cupboard') catDisplay = 'Bed & Cupboard Combo';
        else catDisplay = catDisplay.charAt(0).toUpperCase() + catDisplay.slice(1).replace('-', ' ');

        // Provide a default image root if relative path is used
        let imgUrl = product.image;
        if (!imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
            imgUrl = '/static/' + imgUrl;
        }

        tr.innerHTML = `
            <td><img src="${imgUrl}" alt="${product.name}" onerror="this.src='/static/images/logo.png'"></td>
            <td style="font-weight: 500; color: var(--color-primary);">${product.name}</td>
            <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${catDisplay}</span></td>
            <td>${product.price}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="openModal(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal(id = null) {
    if (id) {
        const p = products.find(prod => prod.id === id);
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = p.id;
        document.getElementById('productName').value = p.name;
        document.getElementById('productCategory').value = p.category;
        document.getElementById('productPrice').value = p.price;
        document.getElementById('productImage').value = p.image;
    } else {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        form.reset();
        document.getElementById('productId').value = '';
    }
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: document.getElementById('productPrice').value,
        image: document.getElementById('productImage').value
    };

    try {
        if (id) {
            // Update
            await fetch('/api/products/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        await fetchProducts();
        await fetchStats();
        closeModal();
    } catch(err) {
        alert("Error saving product: " + err.message);
    }
});

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await fetch('/api/products/' + id, { method: 'DELETE' });
            await fetchProducts();
            await fetchStats();
        } catch(err) {
            alert("Error deleting product: " + err.message);
        }
    }
}

// Initial fetch
fetchStats();
fetchProducts();

