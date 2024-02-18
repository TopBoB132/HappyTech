
document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDnrqY6QcC7sy0Bs2b5rqbMEdxnSivHnYw",
        authDomain: "test-450b4.firebaseapp.com",
        databaseURL: "https://test-450b4-default-rtdb.firebaseio.com/",
        projectId: "test-450b4",
        storageBucket: "test-450b4.appspot.com",
        messagingSenderId: "1064982470352",
        appId: "1:1064982470352:web:0e4c3341608f5c8a9688d5",
        measurementId: "G-BN586LR0SR"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.database();

    // DOM elements
    const loginForm = document.getElementById('login-form');
    const userEmailInput = document.getElementById('email');
    const userPasswordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn-primary');
    const greetingLabel = document.getElementById('greeting-label');
    const logOutBtn = document.getElementById('logout');

    // Login event
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = userEmailInput.value;
        const password = userPasswordInput.value;

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                // On successful login
                const user = userCredential.user;
                // Optional: Redirect to another page or update UI
                window.location.href = 'index.html'; // Redirect user
            })
            .catch(error => {
                // Handle login errors
                console.error('Login error:', error);
                // Optional: Update UI to show error message
            });
    });

    // Logout event
    logOutBtn.addEventListener('click', e => {
        e.preventDefault();
        auth.signOut().then(() => {
            // On successful logout
            window.location.href = 'login.html'; // Redirect or update UI
        }).catch(error => {
            // Handle logout errors
            console.error('Logout error:', error);
        });
    });

    // Auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            greetingLabel.innerText = `Welcome ${user.email}`; // Update UI
        } else {
            // User is signed out
            // Optional: Redirect to login page or update UI
        }
    });
});
