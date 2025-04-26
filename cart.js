import { auth, onAuthStateChanged, signOut, db, collection, getDocs, query, orderBy, doc, getDoc, deleteDoc, updateDoc } from './firebase.js';

const showAlert = (icon, title, text) => Swal.fire({ icon, title, text });

const updateCartNumber = async (uid) => {
    const cartNum = document.querySelector(".cart-num");
    if (!cartNum) return;

    try {
        const q = query(collection(db, `users/${uid}/cart`));
        const snapshot = await getDocs(q);
        const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().quantity || 1), 0);
        cartNum.textContent = total;
    } catch (error) {
        console.error("Error updating cart number:", error);
    }
};

const loadCart = async () => {
    const cartList = document.getElementById("cartList");
    const cartTotal = document.getElementById("cartTotal");
    if (!cartList || !cartTotal) return showAlert("error", "Error", "Page not loaded correctly.");

    cartList.innerHTML = '<p>Loading cart...</p>';
    try {
        const q = query(collection(db, `users/${auth.currentUser.uid}/cart`), orderBy("added_at", "desc"));
        const snapshot = await getDocs(q);
        cartList.innerHTML = snapshot.empty ? '<p>Your cart is empty.</p>' : '';
        let total = 0;

        for (const cartDoc of snapshot.docs) {
            const cartItem = cartDoc.data();
            const dishDoc = await getDoc(doc(db, "dishes", cartItem.dishId));
            if (dishDoc.exists()) {
                const dish = dishDoc.data();
                const quantity = cartItem.quantity || 1;
                const itemTotal = dish.price * quantity;
                total += itemTotal;

                cartList.innerHTML += `
                    <div class="col-md-3 mb-3">
                        <div class="card cart-item">
                            <div class="card-img-container">
                                <img src="${dish.image_url || 'https://dummyimage.com/400x400/000/fff.png&text=No+Image'}" class="card-img-top" alt="${dish.name}">
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${dish.name}</h5>
                                <p class="card-text"><strong>Price:</strong> PKR ${dish.price}</p>
                                <p class="card-text"><strong>Category:</strong> ${dish.category}</p>
                                <p class="card-text quantity" data-id="${cartDoc.id}"><strong>Quantity:</strong> ${quantity}</p>
                                <p class="card-text"><strong>Total:</strong> PKR ${itemTotal}</p>
                                <div class="cart-Btns">
                                    <button class="btn quantity-btn" onclick="decrement('${cartDoc.id}')"><i class="fa-solid fa-minus"></i></button>
                                    <button class="btn quantity-btn" onclick="increment('${cartDoc.id}')"><i class="fa-solid fa-plus"></i></button>
                                    <button class="btn btn-remove" data-id="${cartDoc.id}"><i class="fa-solid fa-xmark"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        cartTotal.textContent = total.toFixed(2);

        document.querySelectorAll(".btn-remove").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const cartItemId = e.currentTarget.dataset.id;
                try {
                    await deleteDoc(doc(db, `users/${auth.currentUser.uid}/cart`, cartItemId));
                    showAlert("success", "Removed", "Item removed from cart!");
                    loadCart();
                    updateCartNumber(auth.currentUser.uid);
                } catch (error) {
                    showAlert("error", "Error", `Failed to remove item: ${error.message}`);
                }
            });
        });
    } catch (error) {
        cartList.innerHTML = '';
        showAlert("error", "Error", `Failed to load cart: ${error.message}`);
    }
};

window.increment = async (cartItemId) => {
    try {
        const cartDocRef = doc(db, `users/${auth.currentUser.uid}/cart`, cartItemId);
        const cartDoc = await getDoc(cartDocRef);
        if (cartDoc.exists()) {
            await updateDoc(cartDocRef, {
                quantity: (cartDoc.data().quantity || 1) + 1,
                added_at: new Date().toISOString()
            });
            loadCart();
            updateCartNumber(auth.currentUser.uid);
        }
    } catch (error) {
        showAlert("error", "Error", `Failed to increment quantity: ${error.message}`);
    }
};

window.decrement = async (cartItemId) => {
    try {
        const cartDocRef = doc(db, `users/${auth.currentUser.uid}/cart`, cartItemId);
        const cartDoc = await getDoc(cartDocRef);
        if (cartDoc.exists()) {
            const quantity = cartDoc.data().quantity || 1;
            if (quantity > 1) {
                await updateDoc(cartDocRef, {
                    quantity: quantity - 1,
                    added_at: new Date().toISOString()
                });
            } else {
                await deleteDoc(cartDocRef);
            }
            loadCart();
            updateCartNumber(auth.currentUser.uid);
        }
    } catch (error) {
        showAlert("error", "Error", `Failed to decrement quantity: ${error.message}`);
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
                    if (role === "user") {
                        loadCart();
                        updateCartNumber(user.uid);
                    } else {
                        showAlert("error", "Access Denied", "You are not authorized to access this page.");
                        window.location.href = "admin.html";
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