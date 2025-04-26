import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, db, doc, setDoc, getDoc } from './firebase.js';

const showAlert = (icon, title, text) => Swal.fire({ icon, title, text });

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const togglePasswordVisibility = () => {
    document.querySelectorAll(".toggle-password").forEach(toggle => {
        toggle.addEventListener("click", () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector(".eye-icon");
            input.type = input.type === "password" ? "text" : "password";
            icon.src = input.type === "password" ? "https://via.placeholder.com/25" : "https://via.placeholder.com/25";
        });
    });
};

const managePopups = () => {
    const signupCont = document.getElementById("signup-container");
    const loginCont = document.getElementById("login-container");
    const frontPage = document.querySelector(".FrontPage");
    let currentRole = "user";

    const togglePopup = (show, hide, role = "user") => {
        show.style.display = "block";
        hide.style.display = "none";
        document.body.style.overflowY = "hidden";
        frontPage.style.opacity = "0.5";
        frontPage.style.pointerEvents = "none";
        currentRole = role;
        show.querySelectorAll("input").forEach(input => input.value = "");
    };

    const closePopup = (target) => {
        target.style.display = "none";
        document.body.style.overflowY = "auto";
        frontPage.style.opacity = "1";
        frontPage.style.pointerEvents = "auto";
    };

    document.querySelector(".sign-up-btn").addEventListener("click", () => {
        if (!auth.currentUser) togglePopup(signupCont, loginCont);
        else showAlert("warning", "Already Logged In", "Please log out to sign up.");
    });

    document.getElementById("admin-signup-btn").addEventListener("click", () => {
        if (!auth.currentUser) togglePopup(signupCont, loginCont, "admin");
        else showAlert("warning", "Already Logged In", "Please log out to sign up as admin.");
    });

    document.querySelector(".log-in-btn").addEventListener("click", () => {
        if (!auth.currentUser) togglePopup(loginCont, signupCont);
        else showAlert("warning", "Already Logged In", "Please log out to log in.");
    });

    document.querySelectorAll(".close-popup").forEach(btn => {
        btn.addEventListener("click", () => closePopup(document.getElementById(btn.dataset.target)));
    });

    document.querySelectorAll(".switch-form").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            if (!auth.currentUser) {
                const targetId = link.dataset.target;
                togglePopup(
                    document.getElementById(targetId),
                    targetId === "signup-container" ? loginCont : signupCont,
                    targetId === "signup-container" ? "user" : currentRole
                );
            } else {
                showAlert("warning", "Already Logged In", "Please log out to switch accounts.");
            }
        });
    });

    document.getElementById("signupBtn").addEventListener("click", async () => {
        const email = signupCont.querySelector("#su-email").value;
        const password = signupCont.querySelector("#su-password").value;

        if (!email || !password) return showAlert("error", "Missing Fields", "Please enter email and password.");
        if (!validateEmail(email)) return showAlert("error", "Invalid Email", "Please enter a valid email.");
        if (password.length < 6) return showAlert("error", "Weak Password", "Password must be at least 6 characters.");

        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                role: currentRole,
                created_at: new Date().toISOString()
            });
            showAlert("success", "Signup Successful", `Welcome, ${user.email}!`).then(() => {
                closePopup(signupCont);
                window.location.href = currentRole === "admin" ? "admin.html" : "dishes.html";
            });
        } catch (error) {
            showAlert("error", "Signup Failed", error.message);
        }
    });

    document.getElementById("loginBtn").addEventListener("click", async () => {
        const email = loginCont.querySelector("#li-email").value;
        const password = loginCont.querySelector("#li-password").value;

        if (!email || !password) return showAlert("error", "Missing Fields", "Please enter email and password.");
        if (!validateEmail(email)) return showAlert("error", "Invalid Email", "Please enter a valid email.");

        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) throw new Error("User not found. Please sign up.");
            const role = userDoc.data().role;
            showAlert("success", "Login Successful", `Welcome back, ${user.email}!`).then(() => {
                closePopup(loginCont);
                window.location.href = role === "admin" ? "admin.html" : "dishes.html";
            });
        } catch (error) {
            showAlert("error", "Login Failed", error.message);
        }
    });
};

const updateButtonState = (isLoggedIn) => {
    const buttons = [
        document.querySelector(".sign-up-btn"),
        document.querySelector(".log-in-btn"),
        document.getElementById("admin-signup-btn")
    ];
    buttons.forEach(btn => {
        btn.disabled = isLoggedIn;
        btn.style.opacity = isLoggedIn ? "0.5" : "1";
        btn.style.cursor = isLoggedIn ? "not-allowed" : "pointer";
    });
};

document.addEventListener("DOMContentLoaded", () => {
    togglePasswordVisibility();
    managePopups();
    onAuthStateChanged(auth, async (user) => {
        updateButtonState(!!user);
        if (user && window.location.pathname.endsWith("index.html")) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const role = userDoc.data().role;
                    if (role === "admin") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "dishes.html";
                    }
                } else {
                    console.error("User document not found");
                }
            } catch (error) {
                console.error("Error fetching user document:", error);
            }
        }
    });
});