document.addEventListener("DOMContentLoaded", () => {
    // Code for authentication, dropdown, etc.

    // Fetch and display tasks
    function fetchTasks() {
        fetch('/tasks')
            .then(response => response.json())
            .then(tasks => {
                showTasks(tasks);
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }
    fetchTasks();

    // Time input handling
    document.querySelectorAll('.time-input').forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value;
            if (value.length === 2 && !value.includes(':')) {
                e.target.value = value + ':';
            }
        });

        input.addEventListener('keydown', (e) => {
            let value = e.target.value;
            if (e.key === 'Backspace' && value.endsWith(':')) {
                e.target.value = value.slice(0, -1);
            }
        });
    });

    let isEditMode = false;
    let editTaskId = null;

    const createBtn = document.getElementById('addBtn');
    const startTime = document.getElementById('start-time');
    const endTime = document.getElementById('end-time');
    const taskInput = document.querySelector('.textInputWrapper input');
    const addText = document.querySelector('.text1');

    createBtn.onclick = function () {
        const taskData = {
            task: taskInput.value,
            start: startTime.value, 
            end: endTime.value
        };

        if (!isEditMode) {
            if (taskInput.value === '') {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Please enter the task first.",
                });
                clearInputs();
            } else {
                // Create new task
                fetch('/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(taskData),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                      
                        fetchTasks();
                    } else if (data.error) {
                        alert(data.error);
                    }
                })
                .catch(error => {
                    console.error('Error creating task:', error);
                    alert('An error occurred while creating the task.');
                });

                clearInputs();
            }
        } else {
            // Update task details
            fetch(`/tasks/${editTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
            
                    fetchTasks();
                    resetForm();
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error updating task:', error);
                alert('An error occurred while updating the task.');
            });
        }
    };

    function clearInputs() {
        startTime.value = '';
        endTime.value = '';
        taskInput.value = '';
    }

    function resetForm() {
        createBtn.style.setProperty('--before-color', 'linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4)');
        addText.innerHTML = "Create";
        isEditMode = false;
        editTaskId = null;
        clearInputs();
    }

    // Display tasks
    function showTasks(taskList) {
        console.log(taskList)
        // const table = taskList.map((task) => `
        //     <tr class="hi row${task.id}">
        //         <td class="line task">
        //             <div class='task-container'>
        //                 <div id="checklist">
        //                     <input class='checkboxes' id="${task.id}" type="checkbox" name="r" value="${task.id}" ${task.isCompleted ? 'checked' : ''}>
        //                     <label for="${task.id}">${task.task} (${task.time})</label>
        //                 </div>
        //             </div>
        //         </td>
        //         <td class="line delete">
        //             <button onclick='deleteTask(${task.id})' class="noselect">
        //                 <span class="text">Delete</span>
        //             </button>
        //         </td>
        //         <td class="line edit">
        //             <button onclick='editTask(${task.id})' class="noselect">
        //                 <span class="text">Edit</span>
        //             </button>
        //         </td>
        //     </tr>
        // `).join('');
        let table
        console.log(taskList)

        if (window.innerWidth > 800){
            table = taskList.map((task) => `

            <tr class="hi row${task.id}">
                <td class="line task"><div class='task-container' ><div id="checklist"><input class='checkboxes' id="${task.id}" type="checkbox" name="r" value="${task.id}" ${task.isCompleted ? 'checked' : ''}><label for="${task.id}">${task.task}</label></div></div></td>
                <td class="line time">${task.start} -- ${task.end}</td>
                <td class="line delete"><button onclick='deleteTask(${task.id})' id='deleteBtn' class="noselect"><span class="text">Delete</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span></button></td>
                <td class="line edit"><button onclick='editTask(${task.id})' id='editbutton' class="noselect"><span class="text"> Edit</span><span class="icon"><svg fill="#000000" height="24px" width="24px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 348.882 348.882" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M333.988,11.758l-0.42-0.383C325.538,4.04,315.129,0,304.258,0c-12.187,0-23.888,5.159-32.104,14.153L116.803,184.231 c-1.416,1.55-2.49,3.379-3.154,5.37l-18.267,54.762c-2.112,6.331-1.052,13.333,2.835,18.729c3.918,5.438,10.23,8.685,16.886,8.685 c0,0,0.001,0,0.001,0c2.879,0,5.693-0.592,8.362-1.76l52.89-23.138c1.923-0.841,3.648-2.076,5.063-3.626L336.771,73.176 C352.937,55.479,351.69,27.929,333.988,11.758z M130.381,234.247l10.719-32.134l0.904-0.99l20.316,18.556l-0.904,0.99 L130.381,234.247z M314.621,52.943L182.553,197.53l-20.316-18.556L294.305,34.386c2.583-2.828,6.118-4.386,9.954-4.386 c3.365,0,6.588,1.252,9.082,3.53l0.419,0.383C319.244,38.922,319.63,47.459,314.621,52.943z"></path> <path d="M303.85,138.388c-8.284,0-15,6.716-15,15v127.347c0,21.034-17.113,38.147-38.147,38.147H68.904 c-21.035,0-38.147-17.113-38.147-38.147V100.413c0-21.034,17.113-38.147,38.147-38.147h131.587c8.284,0,15-6.716,15-15 s-6.716-15-15-15H68.904c-37.577,0-68.147,30.571-68.147,68.147v180.321c0,37.576,30.571,68.147,68.147,68.147h181.798 c37.576,0,68.147-30.571,68.147-68.147V153.388C318.85,145.104,312.134,138.388,303.85,138.388z"></path> </g> </g></svg></span></button></td>
    
            </tr>
            `).join('');

        }else{
            table = taskList.map((task) =>`

            <tr class="hi row${task.id}">
                
                <!-- <td class="line task"><div class='tasktext' id='${task.id}'>${task.task} ( ${task.start} -- ${task.end} )</div></td> -->
                <td class="line task"><div class='task-container' ><div id="checklist"><input class='checkboxes' id="${task.id}" type="checkbox" name="r" value="${task.id}" ${task.isCompleted ? 'checked' : ''}><label for="${task.id}">${task.task} ( ${task.start} -- ${task.end} )</label></div><button onclick='deleteTask(${task.id})' class="tooltip"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" height="25" width="25"><path fill="#6361D9" d="M8.78842 5.03866C8.86656 4.96052 8.97254 4.91663 9.08305 4.91663H11.4164C11.5269 4.91663 11.6329 4.96052 11.711 5.03866C11.7892 5.11681 11.833 5.22279 11.833 5.33329V5.74939H8.66638V5.33329C8.66638 5.22279 8.71028 5.11681 8.78842 5.03866ZM7.16638 5.74939V5.33329C7.16638 4.82496 7.36832 4.33745 7.72776 3.978C8.08721 3.61856 8.57472 3.41663 9.08305 3.41663H11.4164C11.9247 3.41663 12.4122 3.61856 12.7717 3.978C13.1311 4.33745 13.333 4.82496 13.333 5.33329V5.74939H15.5C15.9142 5.74939 16.25 6.08518 16.25 6.49939C16.25 6.9136 15.9142 7.24939 15.5 7.24939H15.0105L14.2492 14.7095C14.2382 15.2023 14.0377 15.6726 13.6883 16.0219C13.3289 16.3814 12.8414 16.5833 12.333 16.5833H8.16638C7.65805 16.5833 7.17054 16.3814 6.81109 16.0219C6.46176 15.6726 6.2612 15.2023 6.25019 14.7095L5.48896 7.24939H5C4.58579 7.24939 4.25 6.9136 4.25 6.49939C4.25 6.08518 4.58579 5.74939 5 5.74939H6.16667H7.16638ZM7.91638 7.24996H12.583H13.5026L12.7536 14.5905C12.751 14.6158 12.7497 14.6412 12.7497 14.6666C12.7497 14.7771 12.7058 14.8831 12.6277 14.9613C12.5495 15.0394 12.4436 15.0833 12.333 15.0833H8.16638C8.05588 15.0833 7.94989 15.0394 7.87175 14.9613C7.79361 14.8831 7.74972 14.7771 7.74972 14.6666C7.74972 14.6412 7.74842 14.6158 7.74584 14.5905L6.99681 7.24996H7.91638Z" clip-rule="evenodd" fill-rule="evenodd"></path></svg></button></div></td>
                


    
            </tr>
            `).join('');
        }


        document.getElementById('tableb').innerHTML = table;

        // Event listeners for checkbox status change
        document.querySelectorAll('.checkboxes').forEach(checkbox => {
            checkbox.addEventListener('change', function (event) {
                const taskId = event.target.value;
                const isCompleted = event.target.checked;
                fetch(`/tasks/${taskId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isCompleted }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                      
                    } else if (data.error) {
                        alert(data.error);
                    }
                })
                .catch(error => {
                    console.error('Error updating task status:', error);
                    alert('An error occurred while updating the task.');
                });
            });
        });
    }

    // Delete task
    window.deleteTask = function (id) {
        fetch(`/tasks/${id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
            
                fetchTasks();
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            alert('An error occurred while deleting the task.');
        });
    };

    // Edit task
    window.editTask = function (id) {
        fetch(`/tasks/${id}`)
        .then(response => response.json())
        .then(task => {
            console.log(task)
            isEditMode = true;
            editTaskId = id;
            taskInput.value = task.task;
            startTime.value = task.start;
            endTime.value = task.end; 
            createBtn.style.setProperty('--before-color', 'linear-gradient(90deg, #5dffc9, #f441a5, #ffeb3b, #5dffc9)');
            addText.innerHTML = "Edit";
            document.querySelector(`.row${id}`).style.backgroundColor = 'rgba(86, 84, 228, 0.418)';
        })
        .catch(error => {
            console.error('Error fetching task:', error);
            alert('An error occurred while fetching the task details.');
        });
    };
});
