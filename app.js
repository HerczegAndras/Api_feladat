const usersElement = document.querySelector("#users");
const statusElement = document.querySelector("#status");
const countElement = document.querySelector("#user-count");

async function loadUsers() {
	try {
		const response = await fetch("./data/users.json");

		if (!response.ok) {
			throw new Error(`HTTP hiba: ${response.status}`);
		}

		const users = await response.json();
		statusElement.classList.add("d-none");
		countElement.textContent = `${users.length} fő`;

		for (const user of users) {
			const row = document.createElement("tr");

			const name = document.createElement("th");
			
			name.textContent = user.name;

			const emailCell = document.createElement("td");
			const email = document.createElement("a");
			email.className = "link-secondary text-decoration-none";
			email.href = `mailto:${user.email}`;
			email.textContent = user.email;
			emailCell.append(email);

			const city = document.createElement("td");
			city.textContent = user.city;

			const phoneCell = document.createElement("td");
			const phone = document.createElement("a");
			phone.className = "link-secondary text-decoration-none";
			phone.href = `tel:${user.phone}`;
			phone.textContent = user.phone;
			phoneCell.append(phone);

			const roleCell = document.createElement("td");
			const role = document.createElement("span");
			role.className = "badge text-bg-light border fw-normal";
			role.textContent = user.role;
			roleCell.append(role);

			row.append(name, emailCell, city, phoneCell, roleCell);
			usersElement.append(row);
		}
	} catch (error) {
		statusElement.className = "alert alert-danger py-2";
		statusElement.textContent = "Nem sikerült betölteni a felhasználókat.";
		countElement.textContent = "Hiba";
		console.error("Felhasználók betöltési hiba:", error);
	}
}

loadUsers();