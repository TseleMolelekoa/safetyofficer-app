// Initialize data storage
let appData = {
    rollCalls: [],
    checklists: [],
    hazards: [],
    users: []
};

// Try to load existing data
const savedData = localStorage.getItem('safetyOfficerData');
if (savedData) {
    appData = JSON.parse(savedData);
}

// Utility functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isEmailRegistered(email) {
    return appData.users.some(user => user.email === email);
}

function isUsernameRegistered(username) {
    return appData.users.some(user => user.username === username);
}

function saveData() {
    localStorage.setItem('safetyOfficerData', JSON.stringify(appData));
}

function showUserInfo(user) {
    document.getElementById('user-display-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-role').textContent = user.position.charAt(0).toUpperCase() + user.position.slice(1);
    document.getElementById('user-avatar').textContent = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase();
}

function updateDataDisplay() {
    // Update roll call data
    const rollcallDataElement = document.getElementById('rollcall-data');
    if (appData.rollCalls.length > 0) {
        rollcallDataElement.innerHTML = `
            <p>Total records: ${appData.rollCalls.length}</p>
            <p>Last submission: ${new Date(appData.rollCalls[appData.rollCalls.length - 1].timestamp).toLocaleString()}</p>
        `;
    } else {
        rollcallDataElement.textContent = 'No data available';
    }
    
    // Update checklist data
    const checklistDataElement = document.getElementById('checklist-data');
    if (appData.checklists.length > 0) {
        checklistDataElement.innerHTML = `
            <p>Total completed: ${appData.checklists.length}</p>
            <p>Last submission: ${new Date(appData.checklists[appData.checklists.length - 1].timestamp).toLocaleString()}</p>
        `;
    } else {
        checklistDataElement.textContent = 'No data available';
    }
    
    // Update hazard data
    const hazardDataElement = document.getElementById('hazard-data');
    if (appData.hazards.length > 0) {
        const openHazards = appData.hazards.filter(h => h.status === 'open').length;
        hazardDataElement.innerHTML = `
            <p>Total reports: ${appData.hazards.length}</p>
            <p>Open issues: ${openHazards}</p>
            <p>Last report: ${new Date(appData.hazards[appData.hazards.length - 1].timestamp).toLocaleString()}</p>
        `;
    } else {
        hazardDataElement.textContent = 'No data available';
    }
    
    // Update hazards list
    const hazardsListElement = document.getElementById('hazards-list');
    if (appData.hazards.length > 0) {
        hazardsListElement.innerHTML = '';
        
        // Show last 5 hazards
        const recentHazards = appData.hazards.slice(-5).reverse();
        
        recentHazards.forEach(hazard => {
            const hazardElement = document.createElement('div');
            hazardElement.className = 'card hazard-item';
            hazardElement.innerHTML = `
                <div class="card-title">
                    ${hazard.type.toUpperCase()} - 
                    <span class="status-badge status-${hazard.status}">${hazard.status}</span>
                </div>
                <p><strong>Location:</strong> ${hazard.location}</p>
                <p><strong>Severity:</strong> ${hazard.severity}</p>
                <p>${hazard.description}</p>
                <p><small>Reported by: ${hazard.reportedBy} at ${new Date(hazard.timestamp).toLocaleString()}</small></p>
            `;
            hazardsListElement.appendChild(hazardElement);
        });
    } else {
        hazardsListElement.innerHTML = '<p>No hazards reported yet.</p>';
    }
}

// Auto-generate username and employee number for main registration form
function generateMainUserDetails() {
    const firstName = document.getElementById('main-first-name').value.trim().toLowerCase();
    const lastName = document.getElementById('main-last-name').value.trim().toLowerCase();
    const position = document.getElementById('main-position').value;
    
    if (firstName && lastName) {
        document.getElementById('main-username').value = `${firstName}.${lastName}`;
    } else {
        document.getElementById('main-username').value = '';
    }
    
    if (position) {
        // Generate employee number based on position
        const positionUsers = appData.users.filter(user => user.position === position);
        const nextNumber = (positionUsers.length + 1).toString().padStart(3, '0');
        
        let prefix = '';
        switch(position) {
            case 'supervisor':
                prefix = 'SUP';
                break;
            case 'miner':
                prefix = 'MIN';
                break;
            case 'safetyofficer':
                prefix = 'SFO';
                break;
        }
        
        document.getElementById('main-employee-number').value = `${prefix}${nextNumber}`;
    } else {
        document.getElementById('main-employee-number').value = '';
    }
}

// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    // Show loading spinner initially
    const loadingSpinner = document.getElementById('loading-spinner');
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // User is logged in, show app content
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            loginScreen.style.display = 'none';
            appContent.style.display = 'block';
            showUserInfo(currentUser);
            updateDataDisplay();
        }, 1000);
    } else {
        // User is not logged in, show login screen
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            loginScreen.style.display = 'flex';
        }, 1000);
    }
    
    // Set current date
    const now = new Date();
    
    // Login/Register tabs functionality
    const loginTabs = document.querySelectorAll('.login-tab');
    const loginForms = document.querySelectorAll('.login-form');
    
    loginTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            loginTabs.forEach(t => t.classList.remove('active'));
            loginForms.forEach(f => f.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`main-${tabName}-form`).classList.add('active');
        });
    });
    
    // Auto-generate username and employee number
    document.getElementById('main-first-name').addEventListener('input', generateMainUserDetails);
    document.getElementById('main-last-name').addEventListener('input', generateMainUserDetails);
    document.getElementById('main-position').addEventListener('change', generateMainUserDetails);
    
    // Main registration form submission
    document.getElementById('main-register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('main-first-name').value.trim();
        const lastName = document.getElementById('main-last-name').value.trim();
        const email = document.getElementById('main-email').value.trim();
        const password = document.getElementById('main-password').value;
        const position = document.getElementById('main-position').value;
        const username = document.getElementById('main-username').value;
        const employeeNumber = document.getElementById('main-employee-number').value;
        
        // Validation
        let isValid = true;
        
        if (!firstName) {
            showError('main-first-name-error', 'First name is required');
            isValid = false;
        } else {
            hideError('main-first-name-error');
        }
        
        if (!lastName) {
            showError('main-last-name-error', 'Last name is required');
            isValid = false;
        } else {
            hideError('main-last-name-error');
        }
        
        if (!email) {
            showError('main-email-error', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('main-email-error', 'Please enter a valid email');
            isValid = false;
        } else if (isEmailRegistered(email)) {
            showError('main-email-error', 'Email is already registered');
            isValid = false;
        } else {
            hideError('main-email-error');
        }
        
        if (!password || password.length < 6) {
            showError('main-password-error', 'Password must be at least 6 characters');
            isValid = false;
        } else {
            hideError('main-password-error');
        }
        
        if (!position) {
            showError('main-position-error', 'Please select a position');
            isValid = false;
        } else {
            hideError('main-position-error');
        }
        
        if (isUsernameRegistered(username)) {
            showError('main-email-error', 'Username is already taken');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Create new user
        const newUser = {
            firstName,
            lastName,
            email,
            password, // In a real app, this would be hashed
            position,
            username,
            employeeNumber,
            registeredAt: new Date().toISOString()
        };
        
        appData.users.push(newUser);
        saveData();
        
        // Auto login after registration
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Show success message and redirect to app
        alert('Registration successful! You are now logged in.');
        
        // Show loading spinner briefly
        loadingSpinner.style.display = 'flex';
        loginScreen.style.display = 'none';
        
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            appContent.style.display = 'block';
            showUserInfo(newUser);
        }, 1000);
    });
    
    // Main login form submission
    document.getElementById('main-login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const loginEmail = document.getElementById('main-login-email').value.trim();
        const password = document.getElementById('main-login-password').value;
        
        // Validation
        let isValid = true;
        
        if (!loginEmail) {
            showError('main-login-email-error', 'Email or username is required');
            isValid = false;
        } else {
            hideError('main-login-email-error');
        }
        
        if (!password) {
            showError('main-login-password-error', 'Password is required');
            isValid = false;
        } else {
            hideError('main-login-password-error');
        }
        
        if (!isValid) return;
        
        // Find user by email or username
        const user = appData.users.find(u => 
            (u.email === loginEmail || u.username === loginEmail) && u.password === password
        );
        
        if (!user) {
            showError('main-login-password-error', 'Invalid email/username or password');
            return;
        }
        
        // Login successful
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Show loading spinner briefly
        loadingSpinner.style.display = 'flex';
        loginScreen.style.display = 'none';
        
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            appContent.style.display = 'block';
            showUserInfo(user);
            updateDataDisplay();
        }, 1000);
    });
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            
            // Show loading spinner briefly
            loadingSpinner.style.display = 'flex';
            appContent.style.display = 'none';
            
            setTimeout(() => {
                loadingSpinner.style.display = 'none';
                loginScreen.style.display = 'flex';
            }, 1000);
        }
    });
    
    // Module navigation
    const moduleItems = document.querySelectorAll('.module-item');
    const moduleContents = document.querySelectorAll('.module-content');
    
    moduleItems.forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Update active module
            moduleItems.forEach(m => m.classList.remove('active'));
            moduleContents.forEach(m => m.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Toggle "Other" input field
    document.getElementById('other-ppe').addEventListener('change', function() {
        document.getElementById('other-ppe-input').style.display = this.checked ? 'block' : 'none';
    });
    
    // Form submissions
    document.getElementById('submit-rollcall').addEventListener('click', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login first');
            return;
        }
        
        const workerId = document.getElementById('worker-id').value;
        const supervisor = document.getElementById('supervisor').value;
        const shift = document.getElementById('shift').value;
        const location = document.getElementById('location').value;
        
        if (!workerId || !supervisor || !location) {
            alert('Please fill in all required fields');
            return;
        }
        
        const rollCall = {
            workerId,
            supervisor,
            shift,
            location,
            timestamp: new Date().toISOString(),
            submittedBy: currentUser.username
        };
        
        appData.rollCalls.push(rollCall);
        saveData();
        updateDataDisplay();
        
        // Reset form
        document.getElementById('worker-id').value = '';
        document.getElementById('supervisor').value = '';
        document.getElementById('location').value = '';
        
        alert('Roll call submitted successfully!');
    });
    
    document.getElementById('submit-checklist').addEventListener('click', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login first');
            return;
        }
        
        const checklistType = document.getElementById('checklist-type').value;
        const jobDescription = document.getElementById('job-description').value;
        const notes = document.getElementById('checklist-notes').value;
        
        // Get all PPE items
        const ppeItems = [];
        document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(item => {
            if (item.id !== 'other-ppe') {
                ppeItems.push({
                    id: item.id,
                    name: item.nextElementSibling.textContent,
                    checked: item.checked
                });
            }
        });
        
        // Get other PPE if specified
        const otherPPE = document.getElementById('other-ppe').checked ? 
            document.getElementById('other-ppe-text').value : '';
        
        const checklist = {
            type: checklistType,
            timestamp: new Date().toISOString(),
            jobDescription,
            ppeItems,
            otherPPE,
            notes,
            submittedBy: currentUser.username
        };
        
        appData.checklists.push(checklist);
        saveData();
        updateDataDisplay();
        
        // Reset form
        document.getElementById('checklist-type').value = 'pre_shift_ppe';
        document.getElementById('job-description').value = '';
        document.getElementById('checklist-notes').value = '';
        
        // Reset checkboxes
        document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(item => {
            if (item.id === 'hearing-protection' || item.id === 'safety-harness' || item.id === 'welding-helmet') {
                item.checked = true;
            } else {
                item.checked = false;
            }
        });
        
        // Hide other input
        document.getElementById('other-ppe-input').style.display = 'none';
        document.getElementById('other-ppe-text').value = '';
        
        alert('Checklist submitted successfully!');
    });
    
    document.getElementById('submit-hazard').addEventListener('click', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login first');
            return;
        }
        
        const hazardType = document.getElementById('hazard-type').value;
        const location = document.getElementById('hazard-location').value;
        const description = document.getElementById('hazard-description').value;
        const severity = document.getElementById('hazard-severity').value;
        
        if (!location || !description) {
            alert('Please fill in location and description fields');
            return;
        }
        
        const hazard = {
            type: hazardType,
            location,
            description,
            severity,
            timestamp: new Date().toISOString(),
            status: 'open',
            reportedBy: currentUser.username
        };
        
        appData.hazards.push(hazard);
        saveData();
        updateDataDisplay();
        
        // Reset form
        document.getElementById('hazard-type').value = 'rockfall';
        document.getElementById('hazard-location').value = '';
        document.getElementById('hazard-description').value = '';
        document.getElementById('hazard-severity').value = 'low';
        
        alert('Hazard reported successfully!');
    });
    
    // Data export
    document.getElementById('export-btn').addEventListener('click', function() {
        const dataStr = JSON.stringify(appData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'safety-data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
    
    // Clear data
    document.getElementById('clear-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            appData = {
                rollCalls: [],
                checklists: [],
                hazards: [],
                users: appData.users // Keep user data
            };
            saveData();
            updateDataDisplay();
            alert('All data has been cleared.');
        }
    });
});