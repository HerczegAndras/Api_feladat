const usersElement = document.querySelector("#users");
const statusElement = document.querySelector("#status");
const countElement = document.querySelector("#user-count");
const form = document.getElementById("form1");

const API_URL = "http://localhost:3000/users";


let editingUserId = null;


async function loadUsers() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP hiba: ${response.status}`);
        }

        const jsonUsers = await response.json();
        renderUsers(jsonUsers);

    } catch (error) {
        statusElement.className = "alert alert-danger py-2";
        statusElement.textContent = "Nem sikerült betölteni a felhasználókat.";
        countElement.textContent = "Hiba";
        console.error("Felhasználók betöltési hiba:", error);
    }
}


function renderUsers(users) {
    usersElement.innerHTML = ""; 
    statusElement.classList.add("d-none");
    countElement.textContent = `${users.length} fő`;

    const oszlopok = ["name", "email", "city", "phone", "role"];

    users.forEach(user => {
        const row = document.createElement("tr");

       
        oszlopok.forEach((kulcs, index) => {
            const cell = document.createElement("td");

            if (index === 0) {
                cell.className = "py-3 ps-4 fw-semibold";
            } else {
                cell.className = "py-3";
            }

            if (kulcs === "role") {
                const badge = document.createElement("span");
                badge.className = "badge rounded-pill text-bg-success bg-opacity-75 px-3 py-2 fw-normal";
                badge.textContent = user[kulcs];
                cell.append(badge);
            } else {
                cell.textContent = user[kulcs];
            }

            row.append(cell);
        });

       
        const actionCell = document.createElement("td");
        actionCell.className = "py-3 pe-4 text-end";

       
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-outline-success btn-sm border-0 me-1";
        editBtn.innerHTML = `<i class="bi bi-pencil-square"></i>`;
        editBtn.title = "Felhasználó szerkesztése";
        editBtn.addEventListener("click", () => startEdit(user));

       
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-outline-danger btn-sm border-0";
        deleteBtn.innerHTML = `<i class="bi bi-trash-fill"></i>`;
        deleteBtn.title = "Felhasználó törlése";
        deleteBtn.addEventListener("click", () => deleteUsers(user.id));

        actionCell.append(editBtn, deleteBtn);
        row.append(actionCell);

        usersElement.append(row);
    });
}


function showFormError(message) {
    let errorDiv = document.getElementById("form-error");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "form-error";
        errorDiv.className = "alert alert-danger py-2 mt-3";
        form.append(errorDiv);
    }
    errorDiv.textContent = message;
}


function startEdit(user) {
    editingUserId = user.id;

    
    document.getElementById("nev").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("varos").value = user.city;
    document.getElementById("telszam").value = user.phone;
    document.getElementById("szerepkor").value = user.role;

    
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.innerHTML = `<i class="bi bi-check-circle me-2"></i>Módosítás mentése`;
    submitBtn.className = "btn btn-warning px-4 py-2 fw-semibold text-white";

    
    let cancelBtn = document.getElementById("cancel-btn");
    if (!cancelBtn) {
        cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.id = "cancel-btn";
        cancelBtn.className = "btn btn-secondary px-4 py-2 fw-semibold ms-2";
        cancelBtn.innerHTML = `<i class="bi bi-x-circle me-2"></i>Mégse`;
        cancelBtn.addEventListener("click", resetFormState);
        submitBtn.parentElement.append(cancelBtn);
    }

    form.scrollIntoView({ behavior: "smooth" });
}


function resetFormState() {
    editingUserId = null;
    form.reset();

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.innerHTML = `<i class="bi bi-plus-circle me-2"></i>Hozzáadás`;
    submitBtn.className = "btn btn-irish px-4 py-2 fw-semibold";

    const cancelBtn = document.getElementById("cancel-btn");
    if (cancelBtn) cancelBtn.remove();

    const errorDiv = document.getElementById("form-error");
    if (errorDiv) errorDiv.remove();
}


async function handleFormSubmit(event) {
    event.preventDefault(); 

    const existingError = document.getElementById("form-error");
    if (existingError) existingError.remove();

    const name = document.getElementById("nev").value.trim();
    const email = document.getElementById("email").value.trim();
    const city = document.getElementById("varos").value.trim();
    const phone = document.getElementById("telszam").value.trim();
    const role = document.getElementById("szerepkor").value.trim();

   
    if (!name || !email || !city || !phone || !role) {
        showFormError("Minden mező kitöltése kötelező!");
        return;
    }

    const phoneRegex = /^[+]?[0-9\s\-]{6,20}$/;
    if (!phoneRegex.test(phone)) {
        showFormError("A telefonszám csak számokat, szóközt, kötőjelet és '+' jelet tartalmazhat!");
        document.getElementById("telszam").focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormError("Kérlek adj meg egy érvényes e-mail címet!");
        document.getElementById("email").focus();
        return;
    }

    const userData = { name, email, city, phone, role };

    try {
        let response;

        if (editingUserId) {
            
            response = await fetch(`${API_URL}/${editingUserId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        } else {
            
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        }

        if (!response.ok) {
            throw new Error(`Mentési hiba: ${response.status}`);
        }

        
        resetFormState();
        await loadUsers();

    } catch (error) {
        showFormError("Nem sikerült menteni az adatokat a szerverre.");
        console.error("Mentési hiba:", error);
    }
}


async function deleteUsers(id) {
    if (!confirm("Biztosan törölni szeretnéd ezt a felhasználót?")) {
        return; 
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Törlési hiba: ${response.status}`);
        }

        
        if (editingUserId === id) {
            resetFormState();
        }

        await loadUsers();

    } catch (error) {
        console.error("DELETE hiba:", error);
        alert("Nem sikerült törölni a felhasználót.");
    }
}


form.addEventListener("submit", handleFormSubmit);


loadUsers();