import type { UserRecord, DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const getFirebaseAdmin = () => {
  try {
    const auth = getAuth();
    const firestore = getFirestore();

    console.log("Firebase Admin services retrieved successfully");
    console.log("Auth service:", !!auth);
    console.log("Firestore service:", !!firestore);

    // Test Firestore connection
    firestore
      .collection("_test_connection")
      .get()
      .then(() => {
        console.log("Firestore connection test successful");
      })
      .catch((error) => {
        console.error("Firestore connection test failed:", error);
      });

    // Auth operations
    const verifyIdToken = async (idToken: string): Promise<DecodedIdToken> => {
      try {
        return await auth.verifyIdToken(idToken);
      } catch (error) {
        throw new Error(`Failed to verify ID token: ${error}`);
      }
    };

    const getUserByUid = async (uid: string): Promise<UserRecord> => {
      try {
        return await auth.getUser(uid);
      } catch (error) {
        throw new Error(`Failed to get user by UID: ${error}`);
      }
    };

    const createUser = async (userData: {
      email: string;
      password?: string;
      displayName?: string;
      photoURL?: string;
    }): Promise<UserRecord> => {
      try {
        return await auth.createUser(userData);
      } catch (error) {
        throw new Error(`Failed to create user: ${error}`);
      }
    };

    const updateUser = async (
      uid: string,
      userData: {
        email?: string;
        displayName?: string;
        photoURL?: string;
        disabled?: boolean;
      }
    ): Promise<UserRecord> => {
      try {
        return await auth.updateUser(uid, userData);
      } catch (error) {
        throw new Error(`Failed to update user: ${error}`);
      }
    };

    const deleteUser = async (uid: string): Promise<void> => {
      try {
        await auth.deleteUser(uid);
      } catch (error) {
        throw new Error(`Failed to delete user: ${error}`);
      }
    };

    // Firestore operations
    const getDocument = async <T = DocumentData>(
      collectionName: string,
      documentId: string
    ): Promise<T | null> => {
      try {
        const docRef = firestore.collection(collectionName).doc(documentId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          return {
            id: docSnap.id,
            ...docSnap.data(),
          } as T;
        }

        return null;
      } catch (error) {
        throw new Error(`Failed to get document: ${error}`);
      }
    };

    const setDocument = async <T = DocumentData>(
      collectionName: string,
      documentId: string,
      data: T
    ): Promise<void> => {
      try {
        console.log(
          `Attempting to set document in collection '${collectionName}' with ID '${documentId}'`
        );
        await firestore
          .collection(collectionName)
          .doc(documentId)
          .set(data as any);
        console.log(
          `Successfully set document in collection '${collectionName}'`
        );
      } catch (error) {
        console.error(`Error in setDocument for ${collectionName}:`, error);
        console.error(`Error details:`, {
          code: (error as any)?.code,
          message: (error as any)?.message,
          details: (error as any)?.details,
          stack: (error as any)?.stack,
        });

        // If collection doesn't exist, try using add() instead
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === 5
        ) {
          console.log(
            `Collection '${collectionName}' doesn't exist, trying alternative approach...`
          );

          try {
            // Try using add() which will create the collection automatically
            console.log(`Trying to create document using add() method...`);
            const docRef = await firestore.collection(collectionName).add({
              ...data,
              id: documentId, // Ensure the id is included in the data
            });
            console.log(
              `Successfully created document in new collection '${collectionName}' with ID: ${docRef.id}`
            );
          } catch (addError) {
            console.error(`Failed to create document using add():`, addError);
            console.error(`Add error details:`, {
              code: (addError as any)?.code,
              message: (addError as any)?.message,
              details: (addError as any)?.details,
            });
            throw new Error(
              `Failed to create document in collection '${collectionName}': ${addError}`
            );
          }
        } else {
          throw new Error(`Failed to set document: ${error}`);
        }
      }
    };

    const updateDocument = async <T = DocumentData>(
      collectionName: string,
      documentId: string,
      data: Partial<T>
    ): Promise<void> => {
      try {
        await firestore.collection(collectionName).doc(documentId).update(data);
      } catch (error) {
        throw new Error(`Failed to update document: ${error}`);
      }
    };

    const deleteDocument = async (
      collectionName: string,
      documentId: string
    ): Promise<void> => {
      try {
        await firestore.collection(collectionName).doc(documentId).delete();
      } catch (error) {
        throw new Error(`Failed to delete document: ${error}`);
      }
    };

    const getCollection = async <T = DocumentData>(
      collectionName: string,
      queryConstraints: any[] = []
    ): Promise<T[]> => {
      try {
        let query: any = firestore.collection(collectionName);

        // Apply query constraints
        for (const constraint of queryConstraints) {
          query = query.where(
            constraint.field,
            constraint.operator,
            constraint.value
          );
        }

        const querySnapshot = await query.get();

        return querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
      } catch (error) {
        // If collection doesn't exist, return empty array instead of throwing error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === 5
        ) {
          console.log(
            `Collection '${collectionName}' does not exist yet, returning empty array`
          );
          return [];
        }
        throw new Error(`Failed to get collection: ${error}`);
      }
    };

    const initializeTestData = async () => {
      try {
        console.log("Initializing test data...");

        // Create test locations
        const locations = [
          {
            id: "loc1",
            city: "New York",
            country: "US",
            latitude: 40.7128,
            longitude: -74.006,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc2",
            city: "London",
            country: "GB",
            latitude: 51.5074,
            longitude: -0.1278,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc3",
            city: "Paris",
            country: "FR",
            latitude: 48.8566,
            longitude: 2.3522,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc4",
            city: "Tokyo",
            country: "JP",
            latitude: 35.6895,
            longitude: 139.6917,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc5",
            city: "Sydney",
            country: "AU",
            latitude: -33.8688,
            longitude: 151.2093,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc6",
            city: "Berlin",
            country: "DE",
            latitude: 52.52,
            longitude: 13.405,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc7",
            city: "Moscow",
            country: "RU",
            latitude: 55.7558,
            longitude: 37.6173,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc8",
            city: "Beijing",
            country: "CN",
            latitude: 39.9042,
            longitude: 116.4074,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc9",
            city: "Rome",
            country: "IT",
            latitude: 41.9028,
            longitude: 12.4964,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "loc10",
            city: "Ulaanbaatar",
            country: "MN",
            latitude: 47.8864,
            longitude: 106.9057,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        // Save locations to database
        for (const location of locations) {
          await setDocument("locations", location.id, location);
          console.log(`Location ${location.city} saved to database`);
        }

        //     // Create test departments using setDocument (which handles missing collections)
        //     await setDocument("departments", "dept1", {
        //       id: "dept1",
        //       name: "Engineering",
        //       managerId: "manager1",
        //       createdAt: new Date(),
        //       updatedAt: new Date(),
        //     });

        //     await setDocument("departments", "dept2", {
        //       id: "dept2",
        //       name: "Marketing",
        //       managerId: "manager2",
        //       createdAt: new Date(),
        //       updatedAt: new Date(),
        //     });

        //     // Create test employees
        //     await setDocument("employees", "emp1", {
        //       id: "emp1",
        //       firstName: "John",
        //       lastName: "Doe",
        //       email: "john.doe@company.com",
        //       departmentId: "dept1",
        //       positionId: "pos1",
        //       hireDate: new Date(),
        //       createdAt: new Date(),
        //       updatedAt: new Date(),
        //     });

        //     await setDocument("employees", "emp2", {
        //       id: "emp2",
        //       firstName: "Jane",
        //       lastName: "Smith",
        //       email: "jane.smith@company.com",
        //       departmentId: "dept2",
        //       positionId: "pos2",
        //       hireDate: new Date(),
        //       createdAt: new Date(),
        //       updatedAt: new Date(),
        //     });

        console.log("Test data initialized successfully");
      } catch (error) {
        console.error("Failed to initialize test data:", error);
      }
    };

    return {
      // Auth methods
      verifyIdToken,
      getUserByUid,
      createUser,
      updateUser,
      deleteUser,

      // Firestore methods
      getDocument,
      setDocument,
      updateDocument,
      deleteDocument,
      getCollection,
      initializeTestData,
    };
  } catch (error) {
    console.error("Error getting Firebase Admin services:", error);
    throw new Error(`Failed to get Firebase Admin services: ${error}`);
  }
};
