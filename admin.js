import { auth, onAuthStateChanged, signOut, db, collection, getDocs, query, orderBy, doc, setDoc, deleteDoc, addDoc, getDoc } from './firebase.js';

const showAlert = (icon, title, text) => Swal.fire({ icon, title, text });

const loadDishes = async () => {
    const dishesList = document.getElementById("dishesList");
    if (!dishesList) return showAlert("error", "Error", "Page not loaded correctly.");

    dishesList.innerHTML = '<p>Loading dishes...</p>';
    try {
        const q = query(collection(db, "dishes"), orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        dishesList.innerHTML = snapshot.empty ? '<p>No dishes found.</p>' : '';

        snapshot.forEach(doc => {
            const dish = doc.data();
            const dishId = doc.id;
            dishesList.innerHTML += `
                <div class="col-md-3 mb-3">
                    <div class="card admin">
                        <div class="card-img-container">
                            <img src="${dish.image_url || 'https://dummyimage.com/400x400/000/fff.png&text=No+Image'}" class="card-img-top" alt="${dish.name}">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${dish.name}</h5>
                            <p class="card-text"><strong>Price:</strong> PKR ${dish.price}</p>
                            <p class="card-text"><strong>Category:</strong> ${dish.category}</p>
                            <p class="card-text card-des">${dish.description}</p>
                            <a href="#" class="read-more-link" style="display: none;">Read More</a>
                            <div class="card-actions">
                                <button class="btn-edit" data-id="${dishId}"><i class="fa-solid fa-pencil-alt"></i></button>
                                <button class="btn-delete" data-id="${dishId}"><i class="fa-solid fa-trash-alt"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const dishId = e.currentTarget.dataset.id;
                const dishDoc = await getDoc(doc(db, "dishes", dishId));
                if (dishDoc.exists()) {
                    const dish = dishDoc.data();
                    document.getElementById("dishName").value = dish.name;
                    document.getElementById("dishPrice").value = dish.price;
                    document.getElementById("dishCategory").value = dish.category;
                    document.getElementById("dishDescription").value = dish.description;
                    document.getElementById("dishImage").value = dish.image_url || '';
                    document.getElementById("dishId").value = dishId;
                    document.getElementById("dishModalLabel").textContent = "Edit Dish";
                    new bootstrap.Modal(document.getElementById("dishModal")).show();
                }
            });
        });

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const dishId = e.currentTarget.dataset.id;
                Swal.fire({
                    icon: "warning",
                    title: "Confirm Delete",
                    text: "Are you sure you want to delete this dish?",
                    showCancelButton: true,
                    confirmButtonText: "Delete"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await deleteDoc(doc(db, "dishes", dishId));
                            showAlert("success", "Deleted", "Dish deleted successfully!");
                            loadDishes();
                        } catch (error) {
                            showAlert("error", "Error", `Failed to delete dish: ${error.message}`);
                        }
                    }
                });
            });
        });

        document.querySelectorAll('.card-des').forEach(p => {
            if (p.scrollHeight > p.clientHeight || p.textContent.length > 100) {
                const link = p.nextElementSibling;
                link.style.display = 'block';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    p.classList.toggle('expanded');
                    link.textContent = p.classList.contains('expanded') ? 'Read Less' : 'Read More';
                });
            }
        });
    } catch (error) {
        dishesList.innerHTML = '';
        showAlert("error", "Error", `Failed to load dishes: ${error.message}`);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "index.html";
        } else {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const role = userDoc.data().role;
                    if (role === "admin") {
                        loadDishes();
                    } else {
                        showAlert("error", "Access Denied", "You are not authorized to access this page.");
                        window.location.href = "dishes.html";
                    }
                } else {
                    showAlert("error", "User Not Found", "User data not found.");
                    window.location.href = "index.html";
                }
            } catch (error) {
                showAlert("error", "Error", "Failed to fetch user data.");
                window.location.href = "index.html";
            }
        }
    });

    document.getElementById("saveDishBtn").addEventListener("click", async () => {
        const dishId = document.getElementById("dishId").value;
        const dishData = {
            name: document.getElementById("dishName").value,
            price: parseFloat(document.getElementById("dishPrice").value),
            category: document.getElementById("dishCategory").value,
            description: document.getElementById("dishDescription").value,
            image_url: document.getElementById("dishImage").value || null,
            created_at: new Date().toISOString()
        };

        if (!dishData.name || !dishData.price || !dishData.category) {
            return showAlert("error", "Missing Fields", "Please fill all required fields.");
        }

        try {
            if (dishId) {
                await setDoc(doc(db, "dishes", dishId), dishData, { merge: true });
                showAlert("success", "Updated", "Dish updated successfully!");
            } else {
                await addDoc(collection(db, "dishes"), dishData);
                showAlert("success", "Added", "Dish added successfully!");
            }
            bootstrap.Modal.getInstance(document.getElementById("dishModal")).hide();
            loadDishes();
        } catch (error) {
            showAlert("error", "Error", `Failed to save dish: ${error.message}`);
        }
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        Swal.fire({
            icon: "warning",
            title: "Confirm Logout",
            text: "Are you sure you want to logout?",
            showCancelButton: true,
            confirmButtonText: "OK"
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth).then(() => {
                    showAlert("success", "Logged Out", "You have been logged out.");
                    window.location.href = "index.html";
                }).catch(error => showAlert("error", "Logout Error", error.message));
            }
        });
    });
});