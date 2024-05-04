// Function to update the isManager property in Firebase Realtime Database
function updateIsManager(uid, isManager) {
    const userRef = firebase.database().ref('users').child(uid);

    userRef.update({
        isManager: isManager
    }).then(() => {
        console.log('isManager updated successfully');
    }).catch(error => {
        console.error('Error updating isManager:', error);
    });
}

// Function to update the username in Firebase Realtime Database
function updateUsername(uid, newUsername) {
    const userRef = firebase.database().ref('users').child(uid);

    userRef.update({
        username: newUsername
    }).then(() => {
        console.log('Username updated successfully');
    }).catch(error => {
        console.error('Error updating username:', error);
    });
}

// Function to update the role (whatJob) in Firebase Realtime Database
function updateRole(uid, role) {
    const userRef = firebase.database().ref('users').child(uid);

    userRef.update({
        whatJob: role
    }).then(() => {
        console.log('Role updated successfully');
    }).catch(error => {
        console.error('Error updating role:', error);
    });
}

// Function to add event listeners for changes in table content
function addListenersForTableChanges() {
    const editIcons = document.querySelectorAll('.edit-icon');
    editIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // Get the index of the cell and the user ID
            const cellIndex = parseInt(this.getAttribute('data-index'));
            const uid = this.getAttribute('data-uid');
            handleEdit(this, cellIndex, uid);
        });
    });

    const checkboxes = document.querySelectorAll('.manager-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const parentRow = this.closest('tr');
            if (parentRow) {
                const isManager = this.checked;
                const uid = parentRow.getAttribute('data-uid');

                updateIsManager(uid, isManager);
            } else {
                console.error('Parent row is null.');
            }
        });
    });
}

// Function to handle editing of the cell content
function handleEdit(icon, cellIndex, uid) {
    const cell = icon.parentNode; // Get the cell containing the icon
    const cellContent = cell.querySelector('.editable-hover');
    const oldValue = cellContent.textContent.trim();
    
    let inputConfig = {};
    let inputValidatorMessage = 'You need to enter something';
    
    if (cellIndex === 1) { // If editing the username
        inputConfig = {
            title: 'Edit Username',
            input: 'text',
            inputValue: oldValue
        };
    } else if (cellIndex === 2) { // If editing the role
        inputConfig = {
            title: 'Edit Role',
            input: 'select',
            inputOptions: {
                'Doctor': 'Doctor',
                'Nurse': 'Nurse',
                'Surgeon': 'Surgeon'
            },
            inputValue: oldValue
        };
        inputValidatorMessage = 'You need to select a role';
    }

    Swal.fire({
        ...inputConfig,
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
            if (!value) {
                return inputValidatorMessage;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newValue = result.value.trim();
            cellContent.textContent = newValue;
            if (oldValue !== newValue) {
                // Update the corresponding data in Firebase
                switch (cellIndex) {
                    case 1:
                        updateUsername(uid, newValue);
                        break;
                    case 2:
                        updateRole(uid, newValue);
                        break;
                    default:
                        break;
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Data updated successfully',
                    timer: 1000
                });
            }
        }
    });
}

function populateTable(userData) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    userData.forEach(user => {
        const { email, username, isManager, whatJob } = user.val();
        const uid = user.key; // Get the user's UID
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-uid', uid); // Set the UID as a data attribute

        // Add cells to the row
        const cells = [
            email,
            `<span class="editable-hover">${username}</span>`,
            `<span class="editable-hover role-cell">${whatJob}</span>`,
            `<input type="checkbox" ${isManager ? 'checked' : ''} class="manager-checkbox">`
        ];

        // Add edit icons to each cell except for the third cell
        cells.forEach((cellContent, index) => {
            const tableData = document.createElement('td');
            tableData.innerHTML = cellContent;
            if (index !== 0 && index !== 3) {
                const editIcon = document.createElement('i');
                editIcon.classList.add('fas', 'fa-pencil-alt', 'edit-icon');
                editIcon.setAttribute('data-index', index); // Store the cell index as a data attribute
                editIcon.setAttribute('data-uid', uid); // Store the user ID as a data attribute
                tableData.appendChild(editIcon);
            }
            newRow.appendChild(tableData);
        });

        userTableBody.appendChild(newRow);
    });

    addListenersForTableChanges();
}

document.addEventListener('DOMContentLoaded', function() {
    if (firebase.apps.length === 0) {
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

    const database = firebase.database();
    const usersRef = database.ref('users');
    const auth = firebase.auth();
    let clicked = false;

    document.getElementById('signInButton').addEventListener('click', function() {
        clicked = true;
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            firebase.database().ref('/users/' + user.uid + '/isManager').once('value')
                .then(function(snapshot) {
                    if (snapshot.val() === false) {
                        window.location.href = 'index.html';
                    } else {
                        usersRef.once('value', snapshot => {
                            populateTable(snapshot);
                        }).catch(error => {
                            console.error("Error fetching user data:", error);
                        });
                    }
                });
        } else {
            if (!clicked) {
                window.location.href = 'index.html';
            }
        }
    });
});

// Function to filter users by role
function filterUsersByRole(role) {
    const rows = document.querySelectorAll('#userTableBody tr');
    rows.forEach(row => {
        const roleCell = row.querySelector('.role-cell');
        const isManager = row.querySelector('.manager-checkbox').checked;
        
        if (role === 'Manager') {
            if (isManager) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        } else {
            if (roleCell && roleCell.textContent.trim() === role) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Function to handle show/hide users based on selected checkboxes
function handleCheckboxChange() {
    const showManagers = document.getElementById('showManagersCheckbox').checked;
    const showDoctors = document.getElementById('showDoctorsCheckbox').checked;
    const showNurses = document.getElementById('showNursesCheckbox').checked;
    const showSurgeons = document.getElementById('showSurgeonsCheckbox').checked;

    const selectedProfessions = [];
    if (showDoctors) selectedProfessions.push('Doctor');
    if (showNurses) selectedProfessions.push('Nurse');
    if (showSurgeons) selectedProfessions.push('Surgeon');

    // If only the Manager checkbox is checked, display only managers
    if (showManagers && selectedProfessions.length === 0) {
        const rows = document.querySelectorAll('#userTableBody tr');
        rows.forEach(row => {
            const isManager = row.querySelector('.manager-checkbox').checked;
            if (isManager) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        return;
    }

    // If no checkboxes are checked, display all users
    if (!showManagers && selectedProfessions.length === 0) {
        const rows = document.querySelectorAll('#userTableBody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
        return;
    }

    // Loop through all rows and check if they match any of the selected roles
    const rows = document.querySelectorAll('#userTableBody tr');
    rows.forEach(row => {
        const isManager = row.querySelector('.manager-checkbox').checked;
        const roleCell = row.querySelector('.role-cell');
        const rowRole = roleCell.textContent.trim();

        // Check if the row matches the selected professions and, if applicable, is a manager
        const matchesSelectedProfessions = selectedProfessions.includes(rowRole);
        const matchesManagerFilter = showManagers ? isManager : true;

        // Display the row if it matches the selected professions and, if applicable, is a manager
        if (matchesSelectedProfessions && matchesManagerFilter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Function to handle search by email
function handleSearchByEmail() {
    const searchEmailInput = document.getElementById('searchEmailInput').value.trim().toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');
    rows.forEach(row => {
        const emailCell = row.querySelector('td:first-child');
        if (emailCell && !emailCell.textContent.trim().toLowerCase().includes(searchEmailInput)) {
            row.style.display = 'none';
        } else {
            row.style.display = '';
        }
    });
}

// Add event listener for search input change
document.getElementById('searchEmailInput').addEventListener('input', function() {
    if (this.value.trim() === '') {
        const rows = document.querySelectorAll('#userTableBody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
    } else {
        handleSearchByEmail();
    }
});

// Add event listeners for checkbox changes and search button click
document.getElementById('showManagersCheckbox').addEventListener('change', handleCheckboxChange);
document.getElementById('showDoctorsCheckbox').addEventListener('change', handleCheckboxChange);
document.getElementById('showNursesCheckbox').addEventListener('change', handleCheckboxChange);
document.getElementById('showSurgeonsCheckbox').addEventListener('change', handleCheckboxChange);

// Call this function to initialize the event listeners for table changes
addListenersForTableChanges();
