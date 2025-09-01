# Firebase Integration - HR App

This document provides a comprehensive guide to the Firebase integration in the HR application.

## Overview

The Firebase integration includes:

- **Client-side Firebase SDK** for authentication and Firestore operations
- **Server-side Firebase Admin SDK** for secure server operations
- **Authentication middleware** for protecting API routes
- **Composables** for easy Firebase operations
- **TypeScript support** with proper type definitions

## Quick Start

1. **Environment Setup**: The Firebase configuration is stored in `env/firebase.env`
2. **Installation**: All dependencies are already installed
3. **Testing**: Visit `/test-firebase` to test the integration

## Architecture

### Client-Side (Browser)

- Firebase Auth for user authentication
- Firestore for real-time database operations
- Firebase Analytics for tracking (optional)

### Server-Side (Node.js)

- Firebase Admin SDK for secure operations
- Authentication middleware for API protection
- Server-side composables for admin operations

## Key Files

### Configuration

- `env/firebase.env` - Firebase configuration
- `nuxt.config.ts` - Nuxt configuration with Firebase setup

### Plugins

- `plugins/firebase.ts` - Client-side Firebase initialization
- `plugins/firebase-admin.server.ts` - Server-side Firebase Admin SDK

### Composables

- `composables/useAuth.ts` - Authentication operations
- `composables/useFirestore.ts` - Firestore operations
- `composables/useFirebaseAdmin.ts` - Server-side admin operations
- `composables/useApi.ts` - Authenticated API calls

### Middleware

- `middleware/auth.server.ts` - Server-side authentication middleware

### Types

- `types/firebase.ts` - TypeScript type definitions

## Usage Examples

### Authentication

```vue
<script setup>
const { user, loading, error, isAuthenticated, signIn, logout } = useAuth();

// Sign in
await signIn("user@example.com", "password");

// Sign out
await logout();
</script>

<template>
  <div v-if="isAuthenticated">
    Welcome, {{ user?.email }}!
    <button @click="logout">Logout</button>
  </div>
</template>
```

### Firestore Operations

```vue
<script setup>
const { getCollection, addDocument, updateDocument, deleteDocument } =
  useFirestore();

// Get all employees
const employees = await getCollection("employees");

// Add new employee
const newId = await addDocument("employees", {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
});

// Update employee
await updateDocument("employees", "employee-id", {
  firstName: "Jane",
});

// Delete employee
await deleteDocument("employees", "employee-id");
</script>
```

### Server-Side Operations

```typescript
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

```vue
<script setup>
const { get, post, put, delete: del } = useApi();

// GET request with authentication
const employees = await get("/api/employees");

// POST request with authentication
const newEmployee = await post("/api/employees", {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
});
</script>
```

## API Routes

### Example API Route

```typescript
// server/api/employees/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    const { getCollection } = useFirebaseAdmin();
    const employees = await getCollection("employees");

    return {
      success: true,
      data: employees,
      count: employees.length,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch employees",
    });
  }
});
```

## Security

### Client-Side Security Rules

- Firestore security rules should be configured in Firebase Console
- Authentication state is managed client-side
- Sensitive operations should be performed server-side

### Server-Side Security

- API routes are protected by authentication middleware
- Firebase Admin SDK provides full access (use with caution)
- ID tokens are verified on every authenticated request

## Environment Variables

The following environment variables are required:

### Client-Side (Public)

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID` (optional)

### Server-Side (Private)

- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_PROJECT_ID`

## Testing

1. Start the development server: `npm run dev`
2. Navigate to `/test-firebase`
3. Test authentication, configuration, and API calls

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**

   - Check that environment variables are correctly set
   - Verify the `env/firebase.env` file exists

2. **Authentication errors**

   - Ensure Authentication is enabled in Firebase Console
   - Check that Email/Password sign-in method is enabled

3. **Firestore permission errors**

   - Review Firestore security rules
   - Ensure the user has necessary permissions

4. **Server-side errors**
   - Verify Firebase Admin SDK credentials
   - Check that the service account has proper permissions

### Debug Mode

Enable debug logging in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  debug: true,
});
```

## Best Practices

1. **Security**: Always verify authentication on server-side operations
2. **Error Handling**: Implement proper error handling in all Firebase operations
3. **Type Safety**: Use TypeScript types for better development experience
4. **Performance**: Use real-time listeners sparingly and unsubscribe when done
5. **Testing**: Test both client-side and server-side operations

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Nuxt3 Documentation](https://nuxt.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)


