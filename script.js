// Initialize data storage with all required arrays
let appData = {
    rollCalls: [],
    checklists: [],
    hazards: [],
    workPermits: [],
    vehiclePermits: [],
    users: []
};

// Try to load existing data
const savedData = localStorage.getItem('safetyOfficerData');
if (savedData) {
    try {
        appData = JSON.parse(savedData);
        
        // Ensure all arrays exist (for backward compatibility)
        if (!appData.rollCalls) appData.rollCalls = [];
        if (!appData.checklists) appData.checklists = [];
        if (!appData.hazards) appData.hazards = [];
        if (!appData.workPermits) appData.workPermits = [];
        if (!appData.vehiclePermits) appData.vehiclePermits = [];
        if (!appData.users) appData.users = [];
    } catch (e) {
        console.error("Error parsing saved data:", e);
        // Reset to default if parsing fails
        appData = {
            rollCalls: [],
            checklists: [],
            hazards: [],
            workPermits: [],
            vehiclePermits: [],
            users: []
        };
    }
}

// Utility functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
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
    const displayName = document.getElementById('user-display-name');
    const role = document.getElementById('user-role');
    const avatar = document.getElementById('user-avatar');
    
    if (displayName) displayName.textContent = `${user.firstName} ${user.lastName}`;
    if (role) role.textContent = user.position.charAt(0).toUpperCase() + user.position.slice(1);
    if (avatar) avatar.textContent = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase();
}

function updateDataDisplay() {
    // Update roll call data
    const rollcallDataElement = document.getElementById('rollcall-data');
    if (rollcallDataElement) {
        if (appData.rollCalls.length > 0) {
            rollcallDataElement.innerHTML = `
                <p>Total records: ${appData.rollCalls.length}</p>
                <p>Last submission: ${new Date(appData.rollCalls[appData.rollCalls.length - 1].timestamp).toLocaleString()}</p>
            `;
        } else {
            rollcallDataElement.textContent = 'No data available';
        }
    }
    
    // Update checklist data
    const checklistDataElement = document.getElementById('checklist-data');
    if (checklistDataElement) {
        if (appData.checklists.length > 0) {
            checklistDataElement.innerHTML = `
                <p>Total completed: ${appData.checklists.length}</p>
                <p>Last submission: ${new Date(appData.checklists[appData.checklists.length - 1].timestamp).toLocaleString()}</p>
            `;
        } else {
            checklistDataElement.textContent = 'No data available';
        }
    }
    
    // Update hazard data
    const hazardDataElement = document.getElementById('hazard-data');
    if (hazardDataElement) {
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
    }
    
    // Update work permit data
    const permitDataElement = document.getElementById('permit-data');
    if (permitDataElement) {
        if (appData.workPermits.length > 0) {
            const activePermits = appData.workPermits.filter(p => new Date(p.validTo || p.endTime) > new Date()).length;
            permitDataElement.innerHTML = `
                <p>Total permits: ${appData.workPermits.length}</p>
                <p>Active permits: ${activePermits}</p>
                <p>Last issued: ${new Date(appData.workPermits[appData.workPermits.length - 1].timestamp).toLocaleString()}</p>
            `;
        } else {
            permitDataElement.textContent = 'No data available';
        }
    }
    
    // Update vehicle permit data
    const vehiclePermitDataElement = document.getElementById('vehicle-permit-data');
    if (vehiclePermitDataElement) {
        if (appData.vehiclePermits.length > 0) {
            const activeVehiclePermits = appData.vehiclePermits.filter(p => new Date(p.validTo) > new Date()).length;
            vehiclePermitDataElement.innerHTML = `
                <p>Total permits: ${appData.vehiclePermits.length}</p>
                <p>Active permits: ${activeVehiclePermits}</p>
                <p>Last issued: ${new Date(appData.vehiclePermits[appData.vehiclePermits.length - 1].timestamp).toLocaleString()}</p>
            `;
        } else {
            vehiclePermitDataElement.textContent = 'No data available';
        }
    }
    
    // Update hazards list
    const hazardsListElement = document.getElementById('hazards-list');
    if (hazardsListElement) {
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
}

// Auto-generate username and employee number for main registration form
function generateMainUserDetails() {
    const firstName = document.getElementById('main-first-name')?.value.trim().toLowerCase();
    const lastName = document.getElementById('main-last-name')?.value.trim().toLowerCase();
    const position = document.getElementById('main-position')?.value;
    
    const usernameField = document.getElementById('main-username');
    const employeeNumberField = document.getElementById('main-employee-number');
    
    if (firstName && lastName && usernameField) {
        usernameField.value = `${firstName}.${lastName}`;
    } else if (usernameField) {
        usernameField.value = '';
    }
    
    if (position && employeeNumberField) {
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
            default:
                prefix = 'EMP';
        }
        
        employeeNumberField.value = `${prefix}${nextNumber}`;
    } else if (employeeNumberField) {
        employeeNumberField.value = '';
    }
}

// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    // Show loading spinner initially
    const loadingSpinner = document.getElementById('loading-spinner');
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    
    // Check if user is already logged in
    const currentUserStr = localStorage.getItem('currentUser');
    let currentUser = null;
    
    if (currentUserStr) {
        try {
            currentUser = JSON.parse(currentUserStr);
        } catch (e) {
            console.error("Error parsing current user:", e);
            localStorage.removeItem('currentUser');
        }
    }
    
    if (currentUser) {
        // User is logged in, show app content
        setTimeout(() => {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (loginScreen) loginScreen.style.display = 'none';
            if (appContent) appContent.style.display = 'block';
            showUserInfo(currentUser);
            updateDataDisplay();
        }, 1000);
    } else {
        // User is not logged in, show login screen
        setTimeout(() => {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (loginScreen) loginScreen.style.display = 'flex';
        }, 1000);
    }
    
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
            const targetForm = document.getElementById(`main-${tabName}-form`);
            if (targetForm) targetForm.classList.add('active');
        });
    });
    
    // Auto-generate username and employee number
    const firstNameInput = document.getElementById('main-first-name');
    const lastNameInput = document.getElementById('main-last-name');
    const positionSelect = document.getElementById('main-position');
    
    if (firstNameInput) firstNameInput.addEventListener('input', generateMainUserDetails);
    if (lastNameInput) lastNameInput.addEventListener('input', generateMainUserDetails);
    if (positionSelect) positionSelect.addEventListener('change', generateMainUserDetails);
    
    // Main registration form submission
    const registerForm = document.getElementById('main-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('main-first-name')?.value.trim();
            const lastName = document.getElementById('main-last-name')?.value.trim();
            const email = document.getElementById('main-email')?.value.trim();
            const password = document.getElementById('main-password')?.value;
            const position = document.getElementById('main-position')?.value;
            const username = document.getElementById('main-username')?.value;
            const employeeNumber = document.getElementById('main-employee-number')?.value;
            
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
            
            if (username && isUsernameRegistered(username)) {
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
            if (loadingSpinner) loadingSpinner.style.display = 'flex';
            if (loginScreen) loginScreen.style.display = 'none';
            
            setTimeout(() => {
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                if (appContent) appContent.style.display = 'block';
                showUserInfo(newUser);
            }, 1000);
        });
    }
    
    // Main login form submission
    const loginForm = document.getElementById('main-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const loginEmail = document.getElementById('main-login-email')?.value.trim();
            const password = document.getElementById('main-login-password')?.value;
            
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
            if (loadingSpinner) loadingSpinner.style.display = 'flex';
            if (loginScreen) loginScreen.style.display = 'none';
            
            setTimeout(() => {
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                if (appContent) appContent.style.display = 'block';
                showUserInfo(user);
                updateDataDisplay();
            }, 1000);
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                
                // Show loading spinner briefly
                if (loadingSpinner) loadingSpinner.style.display = 'flex';
                if (appContent) appContent.style.display = 'none';
                
                setTimeout(() => {
                    if (loadingSpinner) loadingSpinner.style.display = 'none';
                    if (loginScreen) loginScreen.style.display = 'flex';
                }, 1000);
            }
        });
    }
    
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
            const targetElement = document.getElementById(target);
            if (targetElement) targetElement.classList.add('active');
        });
    });
    
    // Toggle "Other" input field
    const otherPpeCheckbox = document.getElementById('other-ppe');
    if (otherPpeCheckbox) {
        otherPpeCheckbox.addEventListener('change', function() {
            const otherPpeInput = document.getElementById('other-ppe-input');
            if (otherPpeInput) {
                otherPpeInput.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Form submissions
    // 1. Roll Call submission
    const submitRollcallBtn = document.getElementById('submit-rollcall');
    if (submitRollcallBtn) {
        submitRollcallBtn.addEventListener('click', function() {
            const currentUserStr = localStorage.getItem('currentUser');
            let currentUser = null;
            
            if (currentUserStr) {
                try {
                    currentUser = JSON.parse(currentUserStr);
                } catch (e) {
                    console.error("Error parsing current user:", e);
                }
            }
            
            if (!currentUser) {
                alert('Please login first');
                return;
            }
            
            const workerId = document.getElementById('worker-id')?.value;
            const supervisor = document.getElementById('supervisor')?.value;
            const shift = document.getElementById('shift')?.value;
            const location = document.getElementById('location')?.value;
            
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
            const workerIdInput = document.getElementById('worker-id');
            const supervisorInput = document.getElementById('supervisor');
            const locationInput = document.getElementById('location');
            
            if (workerIdInput) workerIdInput.value = '';
            if (supervisorInput) supervisorInput.value = '';
            if (locationInput) locationInput.value = '';
            
            alert('Roll call submitted successfully!');
        });
    }
    
    // 2. Checklist submission
    const submitChecklistBtn = document.getElementById('submit-checklist');
    if (submitChecklistBtn) {
        submitChecklistBtn.addEventListener('click', function() {
            const currentUserStr = localStorage.getItem('currentUser');
            let currentUser = null;
            
            if (currentUserStr) {
                try {
                    currentUser = JSON.parse(currentUserStr);
                } catch (e) {
                    console.error("Error parsing current user:", e);
                }
            }
            
            if (!currentUser) {
                alert('Please login first');
                return;
            }
            
            const checklistType = document.getElementById('checklist-type')?.value;
            const jobDescription = document.getElementById('job-description')?.value;
            const notes = document.getElementById('checklist-notes')?.value;
            
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
            const otherPPE = document.getElementById('other-ppe')?.checked ? 
                document.getElementById('other-ppe-text')?.value : '';
            
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
            const checklistTypeInput = document.getElementById('checklist-type');
            const jobDescriptionInput = document.getElementById('job-description');
            const notesInput = document.getElementById('checklist-notes');
            const otherPpeTextInput = document.getElementById('other-ppe-text');
            const otherPpeInputDiv = document.getElementById('other-ppe-input');
            
            if (checklistTypeInput) checklistTypeInput.value = 'pre_shift_ppe';
            if (jobDescriptionInput) jobDescriptionInput.value = '';
            if (notesInput) notesInput.value = '';
            
            // Reset checkboxes
            document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(item => {
                if (item.id === 'hearing-protection' || item.id === 'safety-harness' || item.id === 'welding-helmet') {
                    item.checked = true;
                } else {
                    item.checked = false;
                }
            });
            
            // Hide other input
            if (otherPpeInputDiv) otherPpeInputDiv.style.display = 'none';
            if (otherPpeTextInput) otherPpeTextInput.value = '';
            
            alert('Checklist submitted successfully!');
        });
    }
    
    // 3. Hazard submission
    const submitHazardBtn = document.getElementById('submit-hazard');
    if (submitHazardBtn) {
        submitHazardBtn.addEventListener('click', function() {
            const currentUserStr = localStorage.getItem('currentUser');
            let currentUser = null;
            
            if (currentUserStr) {
                try {
                    currentUser = JSON.parse(currentUserStr);
                } catch (e) {
                    console.error("Error parsing current user:", e);
                }
            }
            
            if (!currentUser) {
                alert('Please login first');
                return;
            }
            
            const hazardType = document.getElementById('hazard-type')?.value;
            const location = document.getElementById('hazard-location')?.value;
            const description = document.getElementById('hazard-description')?.value;
            const severity = document.getElementById('hazard-severity')?.value;
            
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
            const hazardTypeInput = document.getElementById('hazard-type');
            const hazardLocationInput = document.getElementById('hazard-location');
            const hazardDescriptionInput = document.getElementById('hazard-description');
            const hazardSeverityInput = document.getElementById('hazard-severity');
            
            if (hazardTypeInput) hazardTypeInput.value = 'rockfall';
            if (hazardLocationInput) hazardLocationInput.value = '';
            if (hazardDescriptionInput) hazardDescriptionInput.value = '';
            if (hazardSeverityInput) hazardSeverityInput.value = 'low';
            
            alert('Hazard reported successfully!');
        });
    }
    
    // 4. Work Permit submission
    const submitPermitBtn = document.getElementById('submit-permit');
    if (submitPermitBtn) {
        submitPermitBtn.addEventListener('click', function() {
            const currentUserStr = localStorage.getItem('currentUser');
            let currentUser = null;
            
            if (currentUserStr) {
                try {
                    currentUser = JSON.parse(currentUserStr);
                } catch (e) {
                    console.error("Error parsing current user:", e);
                }
            }
            
            if (!currentUser) {
                alert('Please login first');
                return;
            }
            
            const permitType = document.getElementById('permit-type')?.value;
            const location = document.getElementById('permit-location')?.value;
            const description = document.getElementById('permit-description')?.value;
            const startTime = document.getElementById('permit-start')?.value;
            const endTime = document.getElementById('permit-end')?.value;
            const issuer = document.getElementById('permit-issuer')?.value;
            const receiver = document.getElementById('permit-receiver')?.value;
            
            if (!location || !description || !startTime || !endTime || !issuer || !receiver) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Get safety precautions
            const precautions = [];
            for (let i = 1; i <= 6; i++) {
                const checkbox = document.getElementById(`precaution-${i}`);
                if (checkbox && checkbox.checked) {
                    precautions.push(checkbox.nextElementSibling.textContent);
                }
            }
            
            const workPermit = {
                type: permitType,
                location,
                description,
                startTime,
                endTime,
                issuer,
                receiver,
                precautions,
                timestamp: new Date().toISOString(),
                issuedBy: currentUser.username,
                status: 'active'
            };
            
            appData.workPermits.push(workPermit);
            saveData();
            updateDataDisplay();
            
            // Reset form
            const permitTypeInput = document.getElementById('permit-type');
            const permitLocationInput = document.getElementById('permit-location');
            const permitDescriptionInput = document.getElementById('permit-description');
            const permitStartInput = document.getElementById('permit-start');
            const permitEndInput = document.getElementById('permit-end');
            const permitIssuerInput = document.getElementById('permit-issuer');
            const permitReceiverInput = document.getElementById('permit-receiver');
            
            if (permitTypeInput) permitTypeInput.value = 'hot-work';
            if (permitLocationInput) permitLocationInput.value = '';
            if (permitDescriptionInput) permitDescriptionInput.value = '';
            if (permitStartInput) permitStartInput.value = '';
            if (permitEndInput) permitEndInput.value = '';
            if (permitIssuerInput) permitIssuerInput.value = '';
            if (permitReceiverInput) permitReceiverInput.value = '';
            
            // Reset checkboxes
            for (let i = 1; i <= 6; i++) {
                const checkbox = document.getElementById(`precaution-${i}`);
                if (checkbox) checkbox.checked = false;
            }
            
            alert('Work permit issued successfully!');
        });
    }
    
    // 5. Vehicle Permit submission
    const submitVehiclePermitBtn = document.getElementById('submit-vehicle-permit');
    if (submitVehiclePermitBtn) {
        submitVehiclePermitBtn.addEventListener('click', function() {
            const currentUserStr = localStorage.getItem('currentUser');
            let currentUser = null;
            
            if (currentUserStr) {
                try {
                    currentUser = JSON.parse(currentUserStr);
                } catch (e) {
                    console.error("Error parsing current user:", e);
                }
            }
            
            if (!currentUser) {
                alert('Please login first');
                return;
            }
            
            const vehicleType = document.getElementById('vehicle-type')?.value;
            const registration = document.getElementById('vehicle-registration')?.value;
            const makeModel = document.getElementById('vehicle-make')?.value;
            const driver = document.getElementById('vehicle-driver')?.value;
            const area = document.getElementById('vehicle-area')?.value;
            const purpose = document.getElementById('vehicle-purpose')?.value;
            const issuer = document.getElementById('vehicle-issuer')?.value;
            const validFrom = document.getElementById('vehicle-validfrom')?.value;
            const validTo = document.getElementById('vehicle-validto')?.value;
            
            if (!registration || !makeModel || !driver || !area || !purpose || !issuer || !validFrom || !validTo) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Get vehicle safety checks
            const safetyChecks = [];
            for (let i = 1; i <= 8; i++) {
                const checkbox = document.getElementById(`vehicle-check-${i}`);
                if (checkbox && checkbox.checked) {
                    safetyChecks.push(checkbox.nextElementSibling.textContent);
                }
            }
            
            const vehiclePermit = {
                type: vehicleType,
                registration,
                makeModel,
                driver,
                area,
                purpose,
                issuer,
                validFrom,
                validTo,
                safetyChecks,
                timestamp: new Date().toISOString(),
                issuedBy: currentUser.username,
                status: 'active'
            };
            
            appData.vehiclePermits.push(vehiclePermit);
            saveData();
            updateDataDisplay();
            
            // Reset form
            const vehicleTypeInput = document.getElementById('vehicle-type');
            const vehicleRegistrationInput = document.getElementById('vehicle-registration');
            const vehicleMakeInput = document.getElementById('vehicle-make');
            const vehicleDriverInput = document.getElementById('vehicle-driver');
            const vehicleAreaInput = document.getElementById('vehicle-area');
            const vehiclePurposeInput = document.getElementById('vehicle-purpose');
            const vehicleIssuerInput = document.getElementById('vehicle-issuer');
            const vehicleValidFromInput = document.getElementById('vehicle-validfrom');
            const vehicleValidToInput = document.getElementById('vehicle-validto');
            
            if (vehicleTypeInput) vehicleTypeInput.value = 'light';
            if (vehicleRegistrationInput) vehicleRegistrationInput.value = '';
            if (vehicleMakeInput) vehicleMakeInput.value = '';
            if (vehicleDriverInput) vehicleDriverInput.value = '';
            if (vehicleAreaInput) vehicleAreaInput.value = '';
            if (vehiclePurposeInput) vehiclePurposeInput.value = '';
            if (vehicleIssuerInput) vehicleIssuerInput.value = '';
            if (vehicleValidFromInput) vehicleValidFromInput.value = '';
            if (vehicleValidToInput) vehicleValidToInput.value = '';
            
            // Reset checkboxes
            for (let i = 1; i <= 8; i++) {
                const checkbox = document.getElementById(`vehicle-check-${i}`);
                if (checkbox) checkbox.checked = false;
            }
            
            alert('Vehicle permit issued successfully!');
        });
    }
    
    // Data export
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const dataStr = JSON.stringify(appData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'safety-data.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        });
    }
    
    // Clear data
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                appData = {
                    rollCalls: [],
                    checklists: [],
                    hazards: [],
                    workPermits: [],
                    vehiclePermits: [],
                    users: appData.users // Keep user data
                };
                saveData();
                updateDataDisplay();
                alert('All data has been cleared.');
            }
        });
    }
});