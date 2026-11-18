const productListElement = document.querySelector("#product-list");
const statusElement = document.querySelector("#status");
const productForm = document.getElementById("product-form");

const API_URL = "http://localhost:3000/products";
const FALLBACK_IMAGE = "https://placehold.co/600x400/e6f4ee/046307?text=Nincs+k%C3%A9p";

async function loadProducts() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP hiba: ${response.status}`);
        }

        const products = await response.json();
        renderProducts(products);

    } catch (error) {
        statusElement.className = "alert alert-danger py-2";
        statusElement.textContent = "Nem sikerült betölteni a termékeket.";
        console.error("Termékek betöltési hiba:", error);
    }
}

function renderProducts(products) {
    productListElement.innerHTML = ""; 
    statusElement.classList.add("d-none");

    if (products.length === 0) {
        productListElement.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>Jelenleg nincsenek termékek a rendszerben.
            </div>`;
        return;
    }

    products.forEach(product => {
        const colDiv = document.createElement("div");
        colDiv.className = "col";

        const imgSrc = product.image && product.image.trim() !== "" ? product.image : FALLBACK_IMAGE;

        colDiv.innerHTML = `
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card">
                <div class="position-relative">
                    <img src="${imgSrc}" 
                         alt="${product.name}" 
                         class="card-img-top product-img"
                         onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
                </div>

                <div class="card-body p-4 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-baseline gap-2 mb-2">
                        <h5 class="card-title fw-bold text-dark mb-0">${product.name}</h5>
                        <span class="fw-bold text-emerald fs-5 text-nowrap">
                            ${Number(product.price).toLocaleString('hu-HU')} Ft
                        </span>
                    </div>
                    
                    <p class="card-text text-muted small flex-grow-1 mt-1">${product.features}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                        <button class="btn btn-outline-success btn-sm px-3 rounded-pill detail-btn">
                            <i class="bi bi-info-circle me-1"></i> Részletek
                        </button>
                        <button class="btn btn-outline-danger btn-sm px-3 rounded-pill delete-btn">
                            <i class="bi bi-trash-fill me-1"></i> Törlés
                        </button>
                    </div>
                </div>
            </div>
        `;

        colDiv.querySelector(".detail-btn").addEventListener("click", () => getProductById(product.id));
        colDiv.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.id));

        productListElement.append(colDiv);
    });
}

function showFormError(message) {
    let errorDiv = document.getElementById("product-form-error");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "product-form-error";
        errorDiv.className = "alert alert-danger py-2 mt-3";
        productForm.append(errorDiv);
    }
    errorDiv.textContent = message;
}

async function postProduct(event) {
    event.preventDefault();

    const existingError = document.getElementById("product-form-error");
    if (existingError) existingError.remove();

    const name = document.getElementById("prod-name").value.trim();
    const price = document.getElementById("prod-price").value.trim();
    const image = document.getElementById("prod-image").value.trim();
    const features = document.getElementById("prod-desc").value.trim();

    if (!name || !price || !image || !features) {
        showFormError("Minden mező kitöltése kötelező!");
        return;
    }

    if (Number(price) <= 0) {
        showFormError("Az árnak 0-nál nagyobbnak kell lennie!");
        document.getElementById("prod-price").focus();
        return;
    }

    try {
        new URL(image);
    } catch {
        showFormError("Kérlek érvényes kép URL-t adj meg (pl. https://...)!");
        document.getElementById("prod-image").focus();
        return;
    }

    const newProduct = { 
        name, 
        price: Number(price), 
        image,
        features 
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct)
        });

        if (!response.ok) {
            throw new Error(`Mentési hiba: ${response.status}`);
        }

        productForm.reset();
        await loadProducts();

    } catch (error) {
        showFormError("Nem sikerült menteni az új terméket a szerverre.");
        console.error("POST hiba:", error);
    }
}

async function getProductById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP hiba: ${response.status}`);
        }

        const product = await response.json();
        const imgSrc = product.image && product.image.trim() !== "" ? product.image : FALLBACK_IMAGE;

        const modalImg = document.getElementById("modal-product-image");
        modalImg.src = imgSrc;
        modalImg.onerror = () => { modalImg.src = FALLBACK_IMAGE; };

        document.getElementById("modal-product-name").textContent = product.name;
        document.getElementById("modal-product-price").textContent = `${Number(product.price).toLocaleString('hu-HU')} Ft`;
        document.getElementById("modal-product-desc").textContent = product.features;

        const productModal = new bootstrap.Modal(document.getElementById("productModal"));
        productModal.show();

    } catch (error) {
        console.error("GET by ID hiba:", error);
    }
}

async function deleteProduct(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt a terméket?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Törlési hiba: ${response.status}`);
        }

        await loadProducts();

    } catch (error) {
        console.error("DELETE hiba:", error);
    }
}

productForm.addEventListener("submit", postProduct);
loadProducts();