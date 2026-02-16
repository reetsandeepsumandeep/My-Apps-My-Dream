// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCR4mJrZQNUqF59HNPYKdv_mBYDnBf2t1I",
    authDomain: "my-apps-my-dream-2006.firebaseapp.com",
    projectId: "my-apps-my-dream-2006",
    storageBucket: "my-apps-my-dream-2006.firebasestorage.app",
    messagingSenderId: "254858137509",
    appId: "1:254858137509:web:407bf8a16627299fd1224c",
    measurementId: "G-3S6PKTCFGE"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('%c🔥 Firebase Connected Successfully!', 'color: #ff9800; font-weight: bold;');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Mobile Menu Toggle
document.getElementById('mobile-menu-btn').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// Close mobile menu when clicking a link
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});

// Idea Form Submission - SAVES TO FIREBASE
document.getElementById('ideaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
    
    const name = document.getElementById('name').value;
    const contact = document.getElementById('contact').value;
    const idea = document.getElementById('idea').value;
    const audience = document.getElementById('audience').value;
    
    const formData = {
        name: name,
        contact: contact,
        idea: idea,
        audience: audience,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        submittedAtTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        // Save to Firebase Firestore
        let docRef;
        if (db) {
            docRef = await db.collection('ideaSubmissions').add(formData);
            console.log('✅ Idea saved to Firebase with ID:', docRef.id);
        }
        
        // Also save to localStorage as backup
        const submissions = JSON.parse(localStorage.getItem('ideaSubmissions') || '[]');
        submissions.push({
            ...formData,
            firebaseId: docRef ? docRef.id : null
        });
        localStorage.setItem('ideaSubmissions', JSON.stringify(submissions));
        
        // Send email notification
        const subject = `New App Idea from ${name}`;
        const body = `
Name: ${name}
Contact: ${contact}

App Idea/Problem:
${idea}

Target Audience: ${audience}

Submitted on: ${new Date().toLocaleString()}
Firebase ID: ${docRef ? docRef.id : 'N/A'}
        `;
        
        // Open email client
        const mailtoLink = `mailto:Freefiretv581@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        
        // Show success message
        document.getElementById('successMessage').classList.remove('hidden');
        
        // Reset form
        this.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            document.getElementById('successMessage').classList.add('hidden');
        }, 5000);
        
        // Scroll to success message
        document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Error saving idea:', error);
        
        // Fallback: save to localStorage only
        const submissions = JSON.parse(localStorage.getItem('ideaSubmissions') || '[]');
        submissions.push({
            ...formData,
            error: error.message
        });
        localStorage.setItem('ideaSubmissions', JSON.stringify(submissions));
        
        // Still show success but with warning
        alert('Idea saved locally! Firebase connection failed but we have your submission.');
        
        // Show success message
        document.getElementById('successMessage').classList.remove('hidden');
        this.reset();
        
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// Download App Function
function downloadApp(appName) {
    if (appName === 'edit-library') {
        // Replace with actual download link
        alert('Edit Library app download link will be available soon!\n\nPlay Store par jald hi aa raha hai!');
        
        // If you have an actual APK or Play Store link, use this instead:
        // window.open('YOUR_PLAY_STORE_LINK', '_blank');
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('shadow-md');
    } else {
        nav.classList.remove('shadow-md');
    }
});

// Animate stats counter on scroll
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.card-hover').forEach(el => {
    observer.observe(el);
});

// ============================================
// FIREBASE ADMIN FUNCTIONS (for you to use)
// ============================================

// Function to get all submissions from Firebase
async function getAllSubmissions() {
    if (!db) {
        console.error('Firebase not initialized');
        return [];
    }
    
    try {
        const snapshot = await db.collection('ideaSubmissions')
            .orderBy('submittedAtTimestamp', 'desc')
            .get();
        
        const submissions = [];
        snapshot.forEach(doc => {
            submissions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('📋 All Submissions:', submissions);
        return submissions;
    } catch (error) {
        console.error('Error getting submissions:', error);
        return [];
    }
}

// Function to update submission status
async function updateSubmissionStatus(submissionId, status) {
    if (!db) {
        console.error('Firebase not initialized');
        return false;
    }
    
    try {
        await db.collection('ideaSubmissions').doc(submissionId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Submission ${submissionId} updated to ${status}`);
        return true;
    } catch (error) {
        console.error('Error updating submission:', error);
        return false;
    }
}

// ============================================
// APPS MANAGEMENT - DYNAMIC FROM FIREBASE
// ============================================

// Fetch and display apps
async function loadApps() {
    if (!db) {
        console.error('Firebase not connected');
        return;
    }

    try {
        const snapshot = await db.collection('apps')
            .orderBy('order', 'asc')
            .get();

        const apps = [];
        snapshot.forEach(doc => {
            apps.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderApps(apps);
        console.log('✅ Loaded', apps.length, 'apps');
    } catch (error) {
        console.error('Error loading apps:', error);
        showDefaultApps();
    }
}

// Render apps in the container
function renderApps(apps) {
    const container = document.getElementById('appsContainer');

    if (!apps || apps.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No apps available yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = apps.map(app => {
        const hasDownload = app.downloadLink && app.downloadLink.trim() !== '';

        return `
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover border border-gray-100">
                <div class="h-48 bg-gradient-to-br ${app.gradient || 'from-indigo-400 to-purple-600'} flex items-center justify-center overflow-hidden relative rounded-t-2xl">
                    ${app.imageUrl ? 
                        `<img src="${app.imageUrl}" alt="${app.name}" class="w-full h-full object-contain rounded-xl">` :
                        `<i class="${app.icon || 'fas fa-mobile-alt'} text-6xl text-white"></i>`
                    }
                </div>
                <div class="p-6">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-2xl font-bold text-gray-800">${app.name || 'App Name'}</h3>
                        <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                            <i class="fas fa-ad mr-1"></i>Free
                        </span>
                    </div>
                    <p class="text-gray-600 mb-4">${app.description || 'App description'}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${(app.tags || []).map(tag => `
                            <span class="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs">${tag}</span>
                        `).join('')}
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-download mr-1"></i> ${app.downloads || '0'}+ Downloads
                        </div>
                        ${hasDownload ? 
                            `<a href="${app.downloadLink}" target="_blank" class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition flex items-center">
                                <i class="fas fa-download mr-2"></i>Download
                            </a>` :
                            `<button class="bg-gray-200 text-gray-600 px-6 py-2 rounded-full cursor-not-allowed flex items-center">
                                <i class="fas fa-clock mr-2"></i>Soon
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show default apps if Firebase fails
function showDefaultApps() {
    const container = document.getElementById('appsContainer');
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <i class="fas fa-exclamation-circle text-4xl text-yellow-500 mb-4"></i>
            <p class="text-gray-600">Apps loading failed. Please refresh.</p>
            <button onclick="loadApps()" class="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
                <i class="fas fa-sync mr-2"></i>Retry
            </button>
        </div>
    `;
}

// Load apps when page loads
document.addEventListener('DOMContentLoaded', loadApps);

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================
console.log('%c👋 Welcome to My Apps My Dream!', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cHave an idea? Submit it and earn ₹10,000!', 'font-size: 16px; color: #764ba2;');
console.log('%c🔥 Firebase Status:', 'font-weight: bold;', db ? 'Connected ✅' : 'Not Connected ❌');
console.log('%c💡 Admin Commands:', 'font-weight: bold;');
console.log('  - getAllSubmissions() - View all idea submissions');
console.log('  - updateSubmissionStatus(id, "approved") - Approve an idea');

// ============================================
// SECRET CODE - ADMIN ACCESS
// ============================================
// Type "10-2-2006 I LOVE YOU" anywhere on the page to open admin
let secretCode = '';
const adminCode = '10-2-2006 I LOVE YOU';

document.addEventListener('keydown', function(e) {
    // Add typed character to secret code string
    secretCode += e.key;
    
    // Keep only the last N characters (length of admin code)
    if (secretCode.length > adminCode.length) {
        secretCode = secretCode.substring(secretCode.length - adminCode.length);
    }
    
    // Check if code matches
    if (secretCode === adminCode) {
        // Open admin page
        window.open('admin.html', '_blank');
        // Reset code
        secretCode = '';
        console.log('%c🔓 Admin Access Granted!', 'color: #10b981; font-weight: bold; font-size: 16px;');
    }
});

console.log('%c🔐 Secret Code Enabled', 'color: #f59e0b;');
