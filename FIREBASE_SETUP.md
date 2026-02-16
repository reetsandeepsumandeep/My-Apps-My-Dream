# 🔥 Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create Project"
3. Enter project name (e.g., "my-apps-ideas")
4. Disable Google Analytics (not needed)
5. Click "Create Project"

## Step 2: Create Firestore Database

1. In Firebase Console, click "Firestore Database" from left menu
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select location (asia-south1 for India)
5. Click "Enable"

## Step 3: Get Your Config

1. Go to Project Settings (gear icon)
2. Click "Your apps" → "Web" (</> icon)
3. Register app:
   - Nickname: My Apps Website
   - Click "Register app"
4. Copy the config object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Update Your Code

1. Open `script.js`
2. Find the `firebaseConfig` object at the top
3. Replace the placeholder values with your actual config

## Step 5: Set Security Rules

1. Go to Firestore Database → Rules
2. Replace with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ideaSubmissions/{document} {
      allow read, write: if true;
    }
    match /apps/{document} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

## ✅ Done!

Now when someone submits an idea, it will:
1. ✅ Save to Firebase Firestore
2. ✅ Also save to localStorage (backup)
3. ✅ Send email to Freefiretv581@gmail.com

## 📝 View Submissions

Open browser console (F12) and type:
```javascript
getAllSubmissions()
```

## 🖼️ Adding Images

1. Put your images in the `images/` folder
2. Reference them like: `images/your-image.png`
3. Current image path: `images/app-preview.png`

Example folder structure:
```
website/
├── index.html
├── script.js
└── images/
    ├── app-preview.png
    ├── edit-library-icon.png
    └── logo.png
```
