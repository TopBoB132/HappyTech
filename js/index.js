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

    // Check if user is signed in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) 
        {
        // User is signed in, fetch the user's name from the database
        var userId = user.uid;
        var userRef = firebase.database().ref('users/' + userId + '/username');
        userRef.once('value', function(snapshot) {
            var username = snapshot.val();
            // Update the welcome message with the user's name
            document.getElementById('welcomeMessage').innerText = 'ברוך הבא ' + username + '!';
        });
        } 
        else 
        {
            document.getElementById('welcomeMessage').innerText = "ברוכים הבאים עלינו!";
        }
    });
});