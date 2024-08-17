
let todaySum
let weekSum
let monthSum

// Create the Chart.js chart with empty data
var ctx = document.getElementById("myChart4").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        datasets: [
            {
                label: 'Focus',
                backgroundColor: "#caf270",
                data: [], // To be filled with data
            },
            {
                label: 'Short Break',
                backgroundColor: "#45c490",
                data: [], // To be filled with data
            },
            {
                label: 'Long Break',
                backgroundColor: "#008d93",
                data: [], // To be filled with data
            }
        ],
    },
    options: {
        tooltips: {
          displayColors: true,
          callbacks:{
            label: function(tooltipItem) {
                return tooltipItem.yLabel + ' minutes'; // Customize tooltip label
            }
          },
          titleFontColor: '#FFFFFF', // White color for tooltip title
          bodyFontColor: '#FFFFFF', 
        },
        scales: {
          xAxes: [{
            stacked: true,
            gridLines: {
              display: false,
            },

          }],
          yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true,
            },
            type: 'linear',
          }]
        },
            responsive: true,
            maintainAspectRatio: false,
            legend: { position: 'bottom' },
    }
});

// Create the Chart.js chart for hourly focus time
var dailyFocusCtx = document.getElementById("dailyFocusChart").getContext('2d');
var dailyFocusChart = new Chart(dailyFocusCtx, {
    type: 'line',
    data: {
        labels: Array.from({length: 24}, (_, i) => i + ':00'), // Labels for hours 0-23
        datasets: [{
            label: 'Focus Time (minutes)',
            borderColor: "#ff5733",
            backgroundColor: "rgba(255, 87, 51, 0.2)",
            data: [], // To be filled with hourly data
            fill: true
        }]
    },
    options: {
        tooltips: {
            callbacks: {
                label: function(tooltipItem) {
                    return tooltipItem.yLabel + ' minutes'; // Customize tooltip label
                }
            },
            titleFontColor: '#FFFFFF', // White color for tooltip title
            bodyFontColor: '#FFFFFF', 
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display: false,
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                type: 'linear',
            }]
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom' },
    }
});

// Create the Chart.js chart for average hourly focus time

var monthlyFocusCtx = document.getElementById("monthlyFocusChart").getContext('2d');
var monthlyFocusChart = new Chart(monthlyFocusCtx, {
    type: 'line',
    data: {
        labels: Array.from({length: 24}, (_, i) => i + ':00'), // Labels for hours 0-23
        datasets: [{
            label: 'Average Focus Time (minutes)',
            borderColor: "#2a9d8f",
            backgroundColor: "rgba(42, 157, 143, 0.2)",
            data: [], // To be filled with average hourly data
            fill: true
        }]
    },
    options: {
        tooltips: {
            callbacks: {
                label: function(tooltipItem) {
                    return tooltipItem.yLabel + ' minutes'; // Customize tooltip label
                }
            },
            titleFontColor: '#FFFFFF', // White color for tooltip title
            bodyFontColor: '#FFFFFF', 
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display: false,
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                type: 'linear',
            }]
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom' },
    }
});


// Total focus time text variables
const todayFocus = document.getElementById('today-focus');
const weekFocus = document.getElementById('week-focus');
const monthFocus = document.getElementById('month-focus');
const analyticsLabel = document.querySelector('.analytics-label')



function fetchSpentTime() {
    fetch('/spentTime')
        .then(response => response.json())
        .then(results => {
            const dataFromDB = results;

            // Get the current date, start of the week (Sunday), and start of today based on local time
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Helper function to check if a date is within this week, today, or this month
            function isInThisWeek(dateStr) {
                const date = new Date(dateStr);
                return date >= startOfWeek && date <= endOfToday;
            }

            function isToday(dateStr) {
                const date = new Date(dateStr);
                return date >= startOfToday && date <= endOfToday;
            }

            function isInThisMonth(dateStr) {
                const date = new Date(dateStr);
                return date >= startOfMonth && date <= endOfToday;
            }

            // Filter data for this week, today, and this month
            const weekData = dataFromDB.filter(entry => isInThisWeek(entry.timestamp));
            const todayData = dataFromDB.filter(entry => isToday(entry.timestamp));
            const yesterdayData = dataFromDB.filter(entry => new Date(entry.timestamp) >= startOfYesterday && new Date(entry.timestamp) < startOfToday);
            const monthData = dataFromDB.filter(entry => isInThisMonth(entry.timestamp));
            const todayFocusData = todayData.filter(ele => ele.mode === 'focus');
            const monthFocusData = monthData.filter(ele => ele.mode === 'focus');
            
            console.log(todayData)
            const hourlyFocus = Array(24).fill(0);
            todayData.forEach(entry => {
                if (entry.mode === 'focus') {
                    const hour = new Date(entry.timestamp).getHours();
                    hourlyFocus[hour] += entry.time_spent;
                }
            });
            const mostProductiveHour = hourlyFocus.indexOf(Math.max(...hourlyFocus));
            console.log(mostProductiveHour)

            // Initialize aggregation objects
            const aggregation = {
                'focus': {},
                'short break': {},
                'long break': {}
            };

            // Helper function to get the day of the week
            function getDayOfWeek(dateStr) {
                const date = new Date(dateStr);
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return days[date.getDay()];
            }

            // Process filtered data for this week
            weekData.forEach(entry => {
                const day = getDayOfWeek(entry.timestamp);
                if (!aggregation[entry.mode][day]) {
                    aggregation[entry.mode][day] = 0;
                }
                aggregation[entry.mode][day] += entry.time_spent;
            });

            // Prepare data for Chart.js
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            // Convert time spent from seconds to minutes and round the result
            const focusData = daysOfWeek.map(day => Math.round((aggregation['focus'][day] || 0) / 60));
            const focusSumMinutes = focusData.reduce((acc, value) => acc + value, 0);

            // Fill the week focus time
            weekFocus.innerHTML = `${Math.floor(focusSumMinutes / 60)}h ${focusSumMinutes % 60}m`;

            // Calculate and fill today focus time
            const todayFocusMinutes = Math.round(todayData.reduce((acc, entry) => acc + (entry.mode === 'focus' ? entry.time_spent : 0), 0) / 60);
            todayFocus.innerHTML = `${Math.floor(todayFocusMinutes / 60)}h ${todayFocusMinutes % 60}m`;

            // Calculate and fill month focus time
            const monthFocusMinutes = Math.round(monthData.reduce((acc, entry) => acc + (entry.mode === 'focus' ? entry.time_spent : 0), 0) / 60);
            todaySum = todayFocusMinutes;
            weekSum = focusSumMinutes;
            monthSum = monthFocusMinutes;
            monthFocus.innerHTML = `${Math.floor(monthFocusMinutes / 60)}h ${monthFocusMinutes % 60}m`;

            const totalYesterdayFocus = Math.round(yesterdayData.reduce((acc, entry) => acc + (entry.mode === 'focus' ? entry.time_spent : 0), 0) / 60);
            const progressPercentage = totalYesterdayFocus === 0 ? 'N/A' : Math.round(((todaySum - totalYesterdayFocus) / totalYesterdayFocus) * 100);
            console.log(progressPercentage)

            const dailyFocus = Array(7).fill(0);
            weekData.forEach(entry => {
                if (entry.mode === 'focus') {
                    const day = new Date(entry.timestamp).getDay();
                    dailyFocus[day] += entry.time_spent;
                }
            });
            const mostProductiveDayIndex = dailyFocus.indexOf(Math.max(...dailyFocus));
            const mostProductiveDay = daysOfWeek[mostProductiveDayIndex];
            console.log(mostProductiveDay)

            // Process and update the chart with the filtered data for this week
            const shortBreakData = daysOfWeek.map(day => Math.round((aggregation['short break'][day] || 0) / 60));
            const longBreakData = daysOfWeek.map(day => Math.round((aggregation['long break'][day] || 0) / 60));
            let hourlyAggregation = Array(24).fill(0);



            // Process filtered data for today
            todayFocusData.forEach(entry => {
                const date = new Date(entry.timestamp);
                const hour = date.getHours();
                hourlyAggregation[hour] += entry.time_spent / 60; // Convert seconds to minutes
            });

            // Prepare data for Chart.js
            const hourlyFocusData = hourlyAggregation.map(mins => Math.round(mins));

            // Update the daily focus chart
            dailyFocusChart.data.datasets[0].data = hourlyFocusData;
            dailyFocusChart.update();
            hourlyAggregation = Array(24).fill(0);

            const hourlyCounts = Array(24).fill(0);

            // Process filtered data for this month
            monthFocusData.forEach(entry => {
                const date = new Date(entry.timestamp);
                const hour = date.getHours();
                hourlyAggregation[hour] += entry.time_spent / 60; // Convert seconds to minutes
                hourlyCounts[hour] += 1;
            });

            // Calculate average hourly focus time
            const hourlyAverage = hourlyAggregation.map((total, index) => hourlyCounts[index] > 0 ? total / hourlyCounts[index] : 0);

            // Prepare data for Chart.js
            const averageHourlyFocusData = hourlyAverage.map(mins => Math.round(mins));

            // Update the monthly focus chart
            monthlyFocusChart.data.datasets[0].data = averageHourlyFocusData;
            monthlyFocusChart.update();

            // Update the week chart
            myChart.data.datasets[0].data = focusData;
            myChart.data.datasets[1].data = shortBreakData;
            myChart.data.datasets[2].data = longBreakData;
            myChart.update();
            console.log(analyticsLabel)
            analyticsLabel.innerHTML = `
                <p><strong>Most Productive Hour Today:</strong> ${mostProductiveHour}:00</p>
                <p><strong>Focus Time Progress Compared to Yesterday:</strong> ${progressPercentage > 0 ? progressPercentage + '% more' : progressPercentage < 0 ? Math.abs(progressPercentage) + '% less' : progressPercentage}</p>
                <p><strong>Most Productive Day This Week:</strong> ${mostProductiveDay}</p>
            `;
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
        });
}


// Fetch and update chart data
fetchSpentTime();


// save goals in the database 
isInSaving = false
const setGoals = document.querySelector('.goals-progress button')
const dailyGoal = document.getElementById('daily-goal')
const weeklyGoal = document.getElementById('weekly-goal')
const monthlyGoal = document.getElementById('monthly-goal')

setGoals.addEventListener('click' , function(){
    if(!isInSaving){
        document.querySelector('.set-goals').classList.add('show');
        isInSaving = true
        setGoals.innerHTML = 'Save'
        setGoals.style.backgroundColor = 'red'
    }else{
        
        document.querySelector('.set-goals').classList.remove('show');
        isInSaving = false
        setGoals.innerHTML = 'Set goals'
        setGoals.style.backgroundColor = '#a184b49c'
        if(!(dailyGoal.value > 0) || !(weeklyGoal.value > 0) || !(monthlyGoal.value > 0)){
            const newParagraph = document.createElement('p');
            newParagraph.textContent = 'Not saved, please make sure all values are greater than 0.';
            newParagraph.style.color = '#bf0a1f'
            newParagraph.style.backgroundColor = '#d4bcd3aa'
            newParagraph.style.borderRadius = '12px'
            newParagraph.style.padding = '12px'
            newParagraph.style.fontSize = '1.2em'
            newParagraph.style.fontWeight = 'bolder'
            newParagraph.style.textAlign = 'center'
            const parentElement = document.querySelector('.goals-progress');
            const childElement = document.querySelector('.goals-progress button');
            parentElement.insertBefore(newParagraph, childElement.nextSibling);
            setTimeout(() => {
                newParagraph.remove();
            }, 1500);
        }else{
            saveGoals(dailyGoal.value*60, weeklyGoal.value*60 , monthlyGoal.value*60)
            fetchUserGoals()
            
        }
    }
    

})

async function saveGoals(daily, weekly , monthly) {
    try {
      const response = await fetch('/api/savegoals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily,
          weekly,
          monthly,
        }),
      });
      if (response.ok) {
        console.log('Time data saved successfully');
      } else {
        console.error('Error saving time data');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
}





// Current goals progress (progress bars) variables
const dailyProgress = document.getElementById('daily-progress')
const weeklyProgress = document.getElementById('weekly-progress')
const monthlyProgress = document.getElementById('monthly-progress')
const allProgresBars = document.querySelectorAll('.progress-bar')

// get current goals set by the users
function fetchUserGoals() {
    fetch('/get_goals')
        .then(response => response.json())
        .then(results => {
            console.log(results)
            if(results.length == 0){
                allProgresBars.forEach(ele => ele.style.display = 'none')
            }else{
                let todayPercentage = ((todaySum*60) / (results[0].daily_goal))*100
                allProgresBars[0].style.width = `${todayPercentage}%`
                allProgresBars[0].innerHTML = `${Math.round(todayPercentage)}%`
                let weekPercentage = ((weekSum*60) / (results[0].weekly_goal))*100
                allProgresBars[1].style.width = `${weekPercentage}%`
                allProgresBars[1].innerHTML = `${Math.round(weekPercentage)}%`
                let monthPercentage = ((monthSum*60) / (results[0].monthly_goal))*100
                allProgresBars[2].style.width = `${monthPercentage}%`
                allProgresBars[2].innerHTML = `${Math.round(monthPercentage)}%`
            }
           

        })
}
fetchUserGoals()
const weekReviewButton = document.getElementById('week-review-button')
weekReviewButton.addEventListener('click' , function(){
    const weekChart = document.querySelector('.week-chart')
    
    weekChart.classList.toggle('return-opacity')
})
const dailyAverageButton = document.getElementById('day-average-button')
dailyAverageButton.addEventListener('click' , function(){
    const dailyAverageChart = document.querySelector('.daily-average-chart')
    
    dailyAverageChart.classList.toggle('return-opacity')
})