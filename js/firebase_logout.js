document.addEventListener('DOMContentLoaded', function() {
    // Show loading indicator before content is loaded
    const loadingToast = Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Initialize Firebase if it hasn't been initialized before
    if (firebase.apps.length === 0) 
    {
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
        
        firebase.initializeApp(firebaseConfig);
    }

    // DOM elements
    const auth = firebase.auth();
    const signInButton = document.getElementById('signInButton');
    const managerLink = document.getElementById('manager');
    const userLink = document.getElementById('user');
    const sharedLink = document.getElementById('shared');

    // Function to handle sign-out
    function handleSignOut(event) {
        console.log("Sign-out button clicked.");
        event.preventDefault(); // Prevent default form submission behavior

        // Get user's profession from database
        const usersRef = firebase.database().ref('users/' + auth.currentUser.uid + '/whatJob');
        usersRef.once('value')
            .then(snapshot => {
                const profession = snapshot.val();
                console.log("User's profession:", profession);

                // Remove user's UID from profession branch
                const professionRef = firebase.database().ref(profession + '/' + auth.currentUser.uid);
                return professionRef.remove();
            })
            .then(() => {
                console.log("User data removed from profession branch successfully.");

                // Sign out the user
                auth.signOut()
                    .then(() => {
                        // Sign-out successful.
                        console.log("User signed out successfully.");
                        // Show SweetAlert2 logout animation
                        Swal.fire({
                            icon: 'success',
                            title: 'Logged out successfully',
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            // Redirect to index.html after SweetAlert2 dismiss
                            console.log("Redirecting to index.html...");
                            console.log("exit3");
                            window.location.href = 'index.html';
                        });
                    })
                    .catch(error => {
                        console.error("Error signing out:", error);
                        // Show SweetAlert2 error message
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Error signing out. Please try again later.'
                        });
                    });
            })
            .catch(error => {
                console.error("Error removing user data from profession branch:", error);
                // Show SweetAlert2 error message
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error signing out. Please try again later.'
                });
            });
    }

    // Auth state changes
    auth.onAuthStateChanged(user => {
        if (user) 
        {
            // Show user panel
            userLink.style.visibility = 'visible';
            // User is signed in
            console.log("User is signed in:", user.uid);
            signInButton.textContent = "התנתקות";
            firebase.database().ref('/users/' + user.uid + '/isManager').once('value')
            .then(function(snapshot) {
                if (snapshot.val() === true) 
                {
                    managerLink.style.visibility = 'visible'; // Show the manager link if user is manager
                    sharedLink.style.visibility = 'visible'; // Show the shared link if user is manager
                }
            });
            signInButton.addEventListener('click', handleSignOut); // Attach event listener
            loadingToast.close(); // Close loading indicator
        } 
        else 
        {
            // User is signed out
            console.log("User is signed out.");
            signInButton.textContent = "התחברות";
            signInButton.href = "signin.html";
            managerLink.style.visibility = 'hidden';
            signInButton.removeEventListener('click', handleSignOut); // Remove event listener
            loadingToast.close(); // Close loading indicator            
        }
    });
});