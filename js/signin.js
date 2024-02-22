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
    const userEmailInput = document.getElementById('email');
    const userPasswordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn-primary');
    const backButton = document.querySelectorAll('.btn-primary')[1]; // Select the second button

    // Login event
    loginButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        const email = userEmailInput.value;
        const password = userPasswordInput.value;

        // Show loading spinner
        Swal.fire({
            title: 'Logging in...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                // On successful login
                const user = userCredential.user;
                console.log("User logged in:", user.uid);

                // Fetch user's profession from the database under "user" branch
                database.ref('users/' + user.uid).once('value')
                    .then(snapshot => {
                        // Close loading spinner
                        Swal.close();

                        const userData = snapshot.val();

                        // Check if userData is not null
                        if (userData) {
                            const profession = userData.whatJob;
                            console.log("User profession:", profession);

                            // Create a new branch with the profession as the key
                            const professionRef = database.ref(profession);

                            // Set the UID as the key and username as the value under the profession branch
                            professionRef.child(user.uid).set(userData.username)
                                .then(() => {
                                    console.log("User added to profession branch successfully.");
                                    // Redirect to index.html after adding profession
                                    window.location.href = 'index.html'; // Redirect user
                                })
                                .catch(error => {
                                    console.error('Error adding user to profession branch:', error);
                                });
                        } else {
                            console.error('User data is null.');
                        }
                    })
                    .catch(error => {
                        // Close loading spinner
                        Swal.close();

                        console.error('Error fetching user data:', error);
                    });
            })
            .catch(error => {
                // Close loading spinner
                Swal.close();

                // Handle login errors
                console.error('Login error:', error);
                // Optional: Update UI to show error message
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Invalid email or password.'
                });
            });
    });

    // Navigate to index.html when "Back" button is clicked
    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // Auth state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            console.log("User is signed in:", user.uid);
        } else {
            // User is signed out
            console.log("User is signed out.");
            // Optional: Redirect to login page or update UI
        }
    });
    
});

const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function (e) {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  this.querySelector('i').classList.toggle('bi-eye');
  this.querySelector('i').classList.toggle('bi-eye-slash');
});
