document.addEventListener('DOMContentLoaded', function() {
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
    let clicked = false;

    document.getElementById('signInButton').addEventListener('click', function() {
        clicked = true;
    });

    // Auth state changes
    auth.onAuthStateChanged(user => {
            if (user) 
            {
                firebase.database().ref('/users/' + user.uid + '/isManager').once('value')
                .then(function(snapshot) {
                    if (snapshot.val() === false) 
                    {
                        console.log("exit3");
                        window.location.href = 'index.html';
                    }
                });
            }
            else
            {
                // redirect to index if user is not signed
                if(!clicked)
                {
                    console.log("btn " + signInButton.checke);
                    window.location.href = 'index.html';
                }
            }
        
    });
});