import { auth, onAuthStateChanged, signOut, db, collection, getDocs, query, orderBy, addDoc, updateDoc, where, doc, getDoc } from './firebase.js';

const showAlert = (icon, title, text) => Swal.fire({ icon, title, text });

const updateCartNumber = async () => {
    const cartNumElements = document.querySelectorAll(".cart-num");
    if (!cartNumElements.length) return;

    try {
        const q = query(collection(db, `users/${auth.currentUser.uid}/cart`));
        const querySnapshot = await getDocs(q);
        let totalQuantity = 0;
        querySnapshot.forEach(doc => {
            totalQuantity += doc.data().quantity || 1;
        });
        cartNumElements.forEach(el => {
            el.textContent = totalQuantity;
        });
        console.log("Cart number updated:", totalQuantity);
    } catch (error) {
        console.error("Error updating cart number:", error);
    }
};

const loadDishes = async () => {
    const dishesShowList = document.getElementById("dishesShowList");
    if (!dishesShowList) {
        console.error("Dishes list not found!");
        showAlert("error", "Error", "Page not loaded correctly. Please refresh.");
        return;
    }

    dishesShowList.innerHTML = '<p>Loading dishes...</p>';
    try {
        const q = query(collection(db, "dishes"), orderBy("created_at", "desc"));
        const querySnapshot = await getDocs(q);
        console.log("Fetched dishes count:", querySnapshot.size);

        dishesShowList.innerHTML = "";
        if (querySnapshot.empty) {
            dishesShowList.innerHTML = '<p>No dishes found.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const dish = doc.data();
            const dishId = doc.id;
            dishesShowList.innerHTML += `
                <div class="col-md-3 mb-3">
                    <div class="card user">
                        <div class="card-img-container">
                            <img src="${dish.image_url }" class="card-img-top" alt="${dish.name}" onerror="this.src='https://dummyimage.com/400x400/000/fff.png&text=Image+Not+Found'">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${dish.name}</h5>
                            <p class="card-text"><strong>Price:</strong> PKR ${dish.price}</p>
                            <p class="card-text"><strong>Category:</strong> ${dish.category}</p>
                            <p class="card-text card-des">${dish.description}</p>
                            <button class="btn-cart" data-id="${dishId}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
        });

        document.querySelectorAll(".btn-cart").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const dishId = e.currentTarget.dataset.id;
                try {
                    const cartRef = collection(db, `users/${auth.currentUser.uid}/cart`);
                    const q = query(cartRef, where("dishId", "==", dishId));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const cartDoc = querySnapshot.docs[0];
                        const currentQuantity = cartDoc.data().quantity || 1;
                        await updateDoc(doc(db, `users/${auth.currentUser.uid}/cart`, cartDoc.id), {
                            quantity: currentQuantity + 1,
                            added_at: new Date().toISOString()
                        });
                        showAlert("success", "Updated Cart", `Quantity increased!`);
                    } else {
                        await addDoc(cartRef, {
                            dishId,
                            quantity: 1,
                            added_at: new Date().toISOString()
                        });
                        showAlert("success", "Added to Cart", `Dish added to your cart!`);
                    }
                    await updateCartNumber();
                } catch (error) {
                    console.error("Error adding to cart:", error);
                    showAlert("error", "Error", `Failed to add to cart: ${error.message}`);
                }
            });
        });
    } catch (error) {
        console.error("Error loading dishes:", error);
        dishesShowList.innerHTML = "";
        showAlert("error", "Error", `Failed to load dishes: ${error.message}`);
    }
};

// Function to wait for user document with retries
const waitForUserDoc = async (uid, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                return { exists: true, data: userDoc.data() };
            }
            console.log(`Attempt ${i + 1}: User document not found, retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            console.error(`Attempt ${i + 1}: Error fetching user document:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return { exists: false };
};

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.log("No user logged in, redirecting to index.html");
            window.location.href = "index.html";
        } else {
            try {
                const result = await waitForUserDoc(user.uid);
                if (result.exists) {
                    const role = result.data.role;
                    if (role === "user") {
                        console.log("User authenticated, UID:", user.uid);
                        loadDishes();
                        updateCartNumber();
                    } else {
                        showAlert("error", "Access Denied", "You are not authorized to access this page.");
                        window.location.href = "admin.html";
                    }
                } else {
                    showAlert("error", "User Not Found", "User data not found. Please sign up again.");
                    window.location.href = "index.html";
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                showAlert("error", "Error", `Failed to fetch user data: ${error.message}`);
                window.location.href = "index.html";
            }
        }
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        Swal.fire({
            icon: "warning",
            title: "Confirm Logout",
            text: "Are you sure you want to logout?",
            showCancelButton: true,
            confirmButtonText: "OK",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth)
                    .then(() => {
                        showAlert("success", "Logged Out", "You have been successfully logged out.");
                        window.location.href = "index.html";
                    })
                    .catch((error) => {
                        console.error("Logout error:", error);
                        showAlert("error", "Logout Error", error.message);
                    });
            }
        });
    });
});
