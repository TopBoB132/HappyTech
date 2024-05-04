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
    const calendar = flatpickr('#calendar', {
        dateFormat: "Y-m-d",
        defaultDate: "today",
        onChange: function(dateStr) {
            // Call a function to update graph data and handwash time based on selected date
            updateGraphData(dateStr);
        }
    });

    // Function to update handwash time display based on selected date
    function updateHandwashTime() {
        const auth = firebase.auth();
        auth.onAuthStateChanged(function(user) {
            if (user) {
                const usersRef = firebase.database().ref('users/' + user.uid + '/handWashTimes');
                usersRef.once('value', function(snapshot) {
                    const handWashTimes = snapshot.val();
                    document.getElementById('handwashTimeValue').textContent = parseInt(handWashTimes);
                });
            }
        });
    }

    // Call updateHandwashTime function when the page loads with today's date
    updateHandwashTime();
    updateGraphData(calendar.selectedDates[0].toISOString());

    // Function to update graph data based on selected date
    function updateGraphData(selectedDate) {
        // Parse selectedDate as a Date object
        const selectedDateObj = new Date(selectedDate);

        // Check if the selected date is valid
        if (isNaN(selectedDateObj.getTime())) {
            console.log("Invalid date: " + selectedDate);
            return;
        }

        // Fetch data from Firebase based on selectedDate
        const auth = firebase.auth();
        auth.onAuthStateChanged(function(user) {
            if (user) 
            {
                const usersRefTimes = firebase.database().ref('users/' + user.uid + '/handWashTimes');
                // Listen for changes in handWashTimes node
                usersRefTimes.on('value', function(snapshot) {
                    const handWashTimes = snapshot.val();
                    document.getElementById('handwashTimeValue').textContent = parseInt(handWashTimes);;
                });
                const usersRef = firebase.database().ref('users/' + user.uid + '/HandWashHistory');
                usersRef.once('value', function(snapshot) {
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
            else
            {
                window.location.href = "index.html";
            }
        });
    }

    // DOM elements
    const ctx = document.getElementById('lineChart').getContext('2d');

    // Define your data
    const data = {
        labels: [],
        datasets: [{
            label: "שיעור ממוצע של איכות השטיפות",
            fill: true,
            backgroundColor: "transparent",
            borderColor: "#0000FF",
            data: [] // This will be populated dynamically
        }, {
            label: "כמות השטיפות",
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
