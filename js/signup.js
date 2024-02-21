document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDnrqY6QcC7sy0Bs2b5rqbMEdxnSivHnYw",
        authDomain: "test-450b4.firebaseapp.com",
        databaseURL: "https://test-450b4-default-rtdb.firebaseio.com",
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
    const professionInput = document.getElementById('profession');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const repeatPasswordInput = document.getElementById('repeat-password');
    const signUpButton = document.querySelector('.btn-primary');

    // Signup event
    signUpButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission behavior

        // Get user inputs
        const profession = professionInput.value;
        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const repeatPassword = repeatPasswordInput.value;

        // Check if any field is empty
        if (!profession || !name || !email || !password || !repeatPassword) {
            Swal.fire({
                icon: 'error',
                title: 'All fields are required',
                text: 'Please fill in all the fields.'
            });
            return; // Exit the function
        }

        // Check if password and repeat password match
        if (password !== repeatPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Passwords do not match',
                text: 'Please make sure your passwords match.'
            });
            return; // Exit the function
        }

        // Show loading spinner
        Swal.fire({
            title: 'Signing up...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });

        // Create user with email and password
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // On successful signup
                const user = userCredential.user;
                console.log("User signed up:", user.uid);

                // Add user details to the database under 'users' branch
                database.ref('users/' + user.uid).set({
                    email: email,
                    handWashTimes: 0,
                    isManager: false,
                    username: name,
                    whatJob: profession
                })
                .then(() => {
                    // Close loading spinner
                    Swal.close();
                    console.log("User details added to database successfully.");

                    // Redirect to login page after signup
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    // Close loading spinner
                    Swal.close();
                    console.error('Error adding user details to database:', error);
                });
            })
            .catch(error => {
                // Close loading spinner
                Swal.close();

                // Handle signup errors
                console.error('Signup error:', error);
                // Optional: Update UI to show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Signup Failed',
                    text: error.message
                });
            });
    });
});
