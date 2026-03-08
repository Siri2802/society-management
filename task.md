Here's the prompt:

I am building a Society Management System using React (Vite) + Tailwind CSS + React Router v6 + Firebase. I need a complete, clean Firebase authentication pipeline with zero hardcoded values.
Environment setup:
All Firebase config values must come exclusively from Vite environment variables (VITE_FIREBASE_*) defined in a .env file. No fallback hardcoded values anywhere in the code. If any env variable is missing, throw a clear error at app startup.
Authentication methods:
Two login methods must be supported:

Email and password (existing users sign in, new users register)
Google Sign-In via Firebase popup (signInWithPopup with GoogleAuthProvider)

Firebase initialization — src/lib/firebase.ts:
Initialize Firebase app, Auth, and Firestore purely from import.meta.env variables. Export app, auth, and db. No hardcoded config values at all.
AuthContext — src/context/AuthContext.jsx:
Must expose: user, loading, error, isAuthenticated, login(email, password), loginWithGoogle(), register(data), logout(), resetPassword(email), setError.
For loginWithGoogle(): call signInWithPopup with GoogleAuthProvider. After successful popup, check if a Firestore document exists for that UID under the users collection. If it does not exist, create one with { name, email, role: 'resident', unit: null, status: 'active', createdAt, provider: 'google' }. If it already exists, use the existing document as-is. This handles both first-time Google login and returning Google users correctly.
For register(data): create Firebase Auth user with email and password, set display name via updateProfile, then write Firestore document with { name, email, role, unit (only for residents), phone, status: 'active', createdAt, provider: 'email' }.
For login(email, password): call signInWithEmailAndPassword. The onAuthStateChanged listener handles setting user state after success.
onAuthStateChanged must: fetch the Firestore users/{uid} document and merge it with the Firebase user object. If the Firestore document does not exist (edge case), set a safe fallback with role resident. Do not render children until the auth state is resolved — show a fullscreen spinner instead.
Map all Firebase error codes to human-readable messages including: auth/invalid-credential, auth/user-not-found, auth/wrong-password, auth/email-already-in-use, auth/weak-password, auth/popup-closed-by-user, auth/account-exists-with-different-credential, auth/network-request-failed.
Login page — src/pages/auth/Login.jsx:
Two clearly separated sign-in options:

A "Continue with Google" button at the top — calls loginWithGoogle(), shows a spinner while loading, handles errors inline.
A divider ("or continue with email").
Email + password form below — with show/hide password toggle, forgot password link, and submit handling.

No demo credentials, no hardcoded test accounts anywhere on this page.
Register page — src/pages/auth/AuthPages.jsx (Register component):
Two-step flow. Step 1: role selection card UI for Resident, Management, Staff. Step 2: name, email, password, confirm password fields — plus flat/unit number field shown only for Resident role. Also include a "Continue with Google" button on Step 1 that registers via Google with the selected role written to Firestore.
ProtectedRoute — src/components/guards/ProtectedRoute.jsx:
Accepts optional roles prop (array of strings). If user is not authenticated, redirect to /login. If roles is provided and user.role is not in the array, redirect to /dashboard. If no roles prop, only check authentication.
Environment file — .env:
Provide a .env.example file with all required keys and empty values:
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
Firestore security rules:
Provide rules where: authenticated users can read and write only their own users/{uid} document. No user can read or write another user's document. Management role users can read all documents in the users collection (needed for admin panel).
Files to produce:

src/lib/firebase.ts
src/context/AuthContext.jsx
src/pages/auth/Login.jsx
src/pages/auth/AuthPages.jsx
src/components/guards/ProtectedRoute.jsx
.env.example
firestore.rules