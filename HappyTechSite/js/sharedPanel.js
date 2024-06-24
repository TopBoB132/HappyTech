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

    // Initialize Firebase if it hasn't been initialized before
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }

     // Initialize Flatpickr with defaultDate set to today
    const calendarInput = document.getElementById('calendar');

    // Disable calendar input initially
    calendarInput.disabled = true;

    const userSelector = document.getElementById('userSelector');

    // Add event listener for user selection
    userSelector.addEventListener('change', function() {
        const selectedUser = userSelector.value;
        if (selectedUser) {
            // Enable calendar input if a user is selected
            calendarInput.disabled = false;
        } else {
            // Disable calendar input if no user is selected
            calendarInput.disabled = true;
        }
    });

    // Add event listener for calendar date change
    calendarInput.addEventListener('change', function() {
        const selectedUser = userSelector.value;
        const selectedDate = calendarInput.value;
        if (selectedUser && selectedDate) {
            updateGraphData(selectedDate, selectedUser);
        } else {
            // Show alert if a date is chosen before selecting a user
            Swal.fire({
                icon: 'warning',
                title: 'נא לבחור תאריך רק אחרי בחירת שם',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    // Populate the user selector
    populateUserSelector();

     // Function to populate the user selector with usernames who have shared their history
     function populateUserSelector() {
        const usersRef = firebase.database().ref('users');
        usersRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                const uid = childSnapshot.key;
                const isSharedHWT = childSnapshot.child('isSharedHWT').val();
                if (isSharedHWT) {
                    const username = childSnapshot.child('username').val();
                    const option = document.createElement('option');
                    option.value = uid;
                    option.textContent = username;
                    userSelector.appendChild(option);
                }
            });

            // Initialize Flatpickr when user selector is populated
            initializeFlatpickr();
        });
    }

    // Function to initialize Flatpickr
    function initializeFlatpickr() {
        flatpickr('#calendar', {
            dateFormat: "Y-m-d",
            defaultDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                const selectedUser = userSelector.value;
                if (selectedUser && dateStr) {
                    updateGraphData(dateStr, selectedUser);
                } else {
                    // Show alert if a date is chosen before selecting a user
                    Swal.fire({
                        icon: 'warning',
                        title: 'נא לבחור תאריך רק אחרי בחירת שם',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            }
        });
    }

    // Function to update graph data based on selected date and user
    function updateGraphData(selectedDate, selectedUser) {
        // Parse selectedDate as a Date object
        const selectedDateObj = new Date(selectedDate);

        // Check if the selected date is valid
        if (isNaN(selectedDateObj.getTime())) {
            console.log("Invalid date: " + selectedDate);
            return;
        }

        // Fetch data from Firebase based on selectedDate and selected user UID
        const usersRef = firebase.database().ref('users/' + selectedUser + '/HandWashHistory');
        usersRef.once('value', function(snapshot) {
            // Check if the branch for the selected user exists
            if (!snapshot.exists()) {
                // Branch for the selected user doesn't exist, show SweetAlert
                Swal.fire({
                    icon: 'info',
                    title: 'אין נתוני שטיפת ידיים',
                    text: 'אין נתוני שטיפת ידיים זמינים עבור המשתמש הנבחר',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }
            // Fetch HandWashHistory data for the selected user
            const handWashData = snapshot.val();

            // Check if handWashData is empty for the selected date
            const handWashDataForSelectedDate = Object.keys(handWashData).filter(key => {
                const [date] = key.split(" ");
                const [year, month, day] = date.split("-");
                return (
                    parseInt(year) === selectedDateObj.getFullYear() &&
                    parseInt(month)-1 === selectedDateObj.getMonth() &&
                    parseInt(day) === selectedDateObj.getDate()
                );
            });

            if (handWashDataForSelectedDate.length === 0) {
                // No hand wash data available for the selected date, show SweetAlert
                Swal.fire({
                    icon: 'info',
                    title: 'אין נתוני שטיפת ידיים',
                    text: 'אין נתוני שטיפת ידיים זמינים עבור התאריך הנבחר',
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }

            // Initialize arrays to store calculated values
            const successRates = Array(17).fill(0); // Initialize with 0 for each hour
            const washCounts = Array(17).fill(0); // Initialize with 0 for each hour
            const labels = [];

            // Loop through each hour
            for (let hour = 6; hour <= 22; hour++) {
                let totalSuccess = 0;
                let totalCount = 0;

                // Loop through each key in handWashData
                for (const key in handWashData) {
                    if (handWashData.hasOwnProperty(key)) {
                        // Parse the key to extract the date and time
                        const dateTimeParts = key.split(" ");
                        const dateParts = dateTimeParts[0].split("-");
                        const timeParts = dateTimeParts[1].split(":");
                        // Extract the date and time components
                        const year = parseInt(dateParts[0]);
                        const month = parseInt(dateParts[1]) - 1; // Months are zero-based in JavaScript Date object
                        const day = parseInt(dateParts[2]);
                        const recordHour = parseInt(timeParts[0]);

                        // Check if the record date matches the selected date and hour
                        if (
                            year === selectedDateObj.getFullYear() &&
                            month === selectedDateObj.getMonth() &&
                            day === selectedDateObj.getDate() &&
                            recordHour === hour
                        ) {
                            // Check if handWashData[key] is a number
                            if (typeof handWashData[key] === 'number') {
                                // Add the numerical value to the appropriate totals
                                totalSuccess += handWashData[key];
                                totalCount++; // Increment the total count
                            }
                        }
                    }
                }

                // Update successRates and washCounts arrays
                successRates[hour - 6] = totalCount > 0 ? totalSuccess / totalCount : 0;
                washCounts[hour - 6] = totalCount;
                labels.push(hour.toString().padStart(2, '0') + ":00");
            }

            // Update chart data
            myChart.data.labels = labels;
            myChart.data.datasets[0].data = successRates;
            myChart.data.datasets[1].data = washCounts;
            myChart.update();
        });
    }

    // DOM elements
    const ctx = document.getElementById('lineChart').getContext('2d');

    // Define your data
    const data = {
        labels: [],
        datasets: [{
            label: "Average Success Rate",
            fill: true,
            backgroundColor: "transparent",
            borderColor: "#0000FF",
            data: [] // This will be populated dynamically
        }, {
            label: "Wash Counts",
            fill: true,
            backgroundColor: "transparent",
            borderColor: "#adb5bd",
            data: [] // This will be populated dynamically
        }]
    };

    // Create the chart with data and options
    var myChart = new Chart(ctx, {
        type: 'line',
        data: data
    });

});
