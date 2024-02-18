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


firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    // Sign in with email and password
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User signed in:', user);

            // Redirect to the home page or dashboard
            window.location.href = "index.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error:', errorCode, errorMessage);
            // Handle errors or display messages to the user
        });
});