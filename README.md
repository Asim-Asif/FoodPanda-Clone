**Foodpanda Clone**
Foodpanda Clone by Asim Asif: A responsive web app mimicking Foodpanda, with user/auth, dish browsing, cart, and admin dashboard. Built with HTML, CSS, JS, Firebase, Bootstrap. AI tools (Grok, ChatGPT, DeepSeek, GitHub Copilot) aided development.
Features

User login/signup with Firebase Authentication
Browse dishes, add to cart, view cart summary
Admin dashboard to manage dishes (add/edit/delete)
Responsive design for mobile, tablet, desktop
Real-time cart updates with Firestore
SweetAlert2 for user-friendly notifications

Technologies Used

Frontend: HTML, CSS, JavaScript, Bootstrap 5, Font Awesome
Backend: Firebase Authentication, Firestore
Libraries: SweetAlert2, Typed.js, jQuery
Fonts: Roboto (Google Fonts)
Version Control: Git, GitHub

Screenshots
Add screenshots here (e.g., homepage, dishes, admin dashboard, cart).
Setup Instructions

Clone the Repository:
git clone https://github.com/your-username/foodpanda-clone.git
cd foodpanda-clone


Install Dependencies:No installations needed; dependencies are served via CDNs.

Firebase Configuration:

Create a Firebase project at Firebase Console.
Enable Email/Password Authentication and Firestore.
Update js/firebase.js with your Firebase config:const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};




Run the Application:

Use a local server (e.g., VS Code Live Server or npx http-server).
Open index.html in your browser.


Admin Access:

Add an admin user in Firestore users collection:{
  "uid": "USER_UID",
  "role": "admin"
}


Log in to access admin.html.



Project Structure
foodpanda-clone/
├── css/
│   └── style.css
├── images/
├── js/
│   ├── app.js
│   ├── firebase.js
│   ├── script.js
│   ├── admin.js
│   ├── dishes.js
│   ├── cart.js
│   └── authState.js
├── index.html
├── admin.html
├── dishes.html
├── cart.html
└── README.md

Credits

Developer: Asim Asif
AI Assistance: Grok (xAI), ChatGPT, DeepSeek, GitHub Copilot

License
MIT License
Contact
Asim Asif: GitHub | Email
