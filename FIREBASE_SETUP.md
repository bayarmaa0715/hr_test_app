# Firebase Integration Setup Guide

This guide will help you set up Firebase (Auth + Firestore) in your Nuxt3 project.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Node.js and npm installed
3. Nuxt3 project (already set up)

## Installation

The Firebase dependencies have already been installed:

```bash
npm install firebase @firebase/app @firebase/auth @firebase/firestore
```

## Configuration

### 1. Environment Variables

The Firebase configuration is stored in `env/firebase.env` and automatically loaded by Nuxt. The configuration includes:

```env
# Client-side Firebase config
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Server-side Firebase config (for admin SDK)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_here"
```

### 2. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the web app icon (</>)
7. Register your app if you haven't already
8. Copy the configuration values to your `.env` file

## Project Structure

The Firebase integration is organized as follows:

```
├── env/
│   └── firebase.env         # Firebase configuration
├── plugins/
│   ├── firebase.ts          # Client-side Firebase initialization
│   └── firebase-admin.server.ts # Server-side Firebase admin
├── composables/
│   ├── useAuth.ts           # Authentication composable
│   ├── useFirestore.ts      # Firestore operations composable
│   ├── useFirebaseAdmin.ts  # Server-side Firebase admin composable
│   └── useApi.ts            # Authenticated API calls composable
├── middleware/
│   └── auth.server.ts       # Server-side authentication middleware
├── server/api/
│   └── employees/           # Example API routes
├── types/
│   └── firebase.ts          # TypeScript type definitions
├── components/
│   ├── Auth/
│   │   └── LoginForm.vue    # Example login component
│   └── Employees/
│       └── EmployeeList.vue # Example Firestore usage
└── nuxt.config.ts           # Updated with runtime config
```

## Usage

### Authentication

The `useAuth` composable provides authentication functionality:

```vue
<script setup>
const { user, loading, error, isAuthenticated, signIn, signUp, logout } =
  useAuth();

// Sign in
await signIn("user@example.com", "password");

// Sign up
await signUp("user@example.com", "password");

// Sign out
await logout();
</script>

<template>
  <div v-if="isAuthenticated">
    Welcome, {{ user?.email }}!
    <button @click="logout">Logout</button>
  </div>
  <div v-else>Please log in</div>
</template>
```

### Firestore Operations

The `useFirestore` composable provides CRUD operations:

```vue
<script setup>
const {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  loading,
  error,
} = useFirestore();

// Get all documents
const employees = await getCollection("employees");

// Get a single document
const employee = await getDocument("employees", "document-id");

// Add a new document
const newId = await addDocument("employees", {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
});

// Update a document
await updateDocument("employees", "document-id", {
  firstName: "Jane",
});

// Delete a document
await deleteDocument("employees", "document-id");

// Real-time subscription
const unsubscribe = subscribeToCollection("employees", [], (data) => {
  console.log("Employees updated:", data);
});
</script>
```

### Query Helpers

Use the built-in query helpers for common operations:

```javascript
const { whereQuery, orderByQuery, limitQuery } = useFirestore();

// Get active employees, ordered by name, limited to 10
const activeEmployees = await getCollection("employees", [
  whereQuery("isActive", "==", true),
  orderByQuery("firstName", "asc"),
  limitQuery(10),
]);
```

### Server-Side Operations

For server-side operations, use the `useFirebaseAdmin` composable:

```javascript
// In server routes or API endpoints
const { getCollection, createUser, verifyIdToken } = useFirebaseAdmin();

// Get all employees
const employees = await getCollection("employees");

// Create a new user
const newUser = await createUser({
  email: "user@example.com",
  password: "password123",
  displayName: "John Doe",
});

// Verify ID token
const decodedToken = await verifyIdToken(idToken);
```

### Authenticated API Calls

Use the `useApi` composable for making authenticated API calls:

```javascript
const { get, post, put, delete: del } = useApi();

// GET request with authentication
const employees = await get("/api/employees");

// POST request with authentication
const newEmployee = await post("/api/employees", {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
});

// PUT request with authentication
await put("/api/employees/123", {
  firstName: "Jane",
});

// DELETE request with authentication
await del("/api/employees/123");
```

## Security Rules

Don't forget to set up Firestore security rules in your Firebase Console:

```javascript
// Example security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to read employees
    match /employees/{employeeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## TypeScript Support

The integration includes TypeScript types for better development experience:

```typescript
import type { Employee, Department, UserProfile } from "~/types/firebase";

// Use typed collections
const employees = await getCollection<Employee>("employees");
const departments = await getCollection<Department>("departments");
```

## Example Components

### LoginForm.vue

Demonstrates authentication with email/password.

### EmployeeList.vue

Shows a complete CRUD interface for managing employees with real-time updates.

## Testing

1. Start your development server: `npm run dev`
2. Navigate to your app
3. Test authentication and Firestore operations
4. Check the browser console for any errors

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**

   - Check that your environment variables are correctly set
   - Ensure the `.env` file is in the project root

2. **Authentication errors**

   - Verify that Authentication is enabled in Firebase Console
   - Check that Email/Password sign-in method is enabled

3. **Firestore permission errors**

   - Review your Firestore security rules
   - Ensure the user has the necessary permissions

4. **TypeScript errors**
   - Make sure all imports are correct
   - Check that types are properly exported

### Debug Mode

Enable debug logging by adding this to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // ... other config
  devtools: { enabled: true },
  debug: true,
});
```

## Next Steps

1. Set up your Firebase project and add the configuration
2. Test the authentication flow
3. Create your Firestore collections
4. Implement your specific business logic
5. Add proper error handling and loading states
6. Set up security rules for production

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Nuxt3 Documentation](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
