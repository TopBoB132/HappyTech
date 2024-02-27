var ctx = document.getElementById('lineChart').getContext('2d');

// Define your data
var data = {
    labels: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
     " 15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
    datasets: [{
        label: "אחוזי הצלחה",
        fill: true,
        backgroundColor: "transparent",
        borderColor: "#0000FF",
        data: [20, 20, 20, 60, 60, 60, 40, 80, 60, 100, 100, 100, 40, 80, 60, 100, 40]
    }, {
        label: "כמות פעמים",
        fill: true,
        backgroundColor: "transparent",
        borderColor: "#adb5bd",
        data: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
    }]
};

// Configure options
var options = {
    scales: {
        xAxes: [{
            reverse: true,
            gridLines: {
            color: "rgba(0,0,0,0.05)"
            }
        }],
        yAxes: [{
            borderDash: [5, 5],
            gridLines: {
            color: "rgba(0,0,0,0)",
            fontColor: "#fff"
            }
        }]
    }
};

// Create the chart
var myChart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: options
});