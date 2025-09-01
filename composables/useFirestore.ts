import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { ref, computed } from "vue";

export const useFirestore = () => {
  const { $firebase } = useNuxtApp();
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Generic CRUD operations
  const getCollection = async <T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> => {
    try {
      loading.value = true;
      error.value = null;

      const q = query(
        collection($firebase.firestore, collectionName),
        ...constraints
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDocument = async <T = DocumentData>(
    collectionName: string,
    documentId: string
  ): Promise<T | null> => {
    try {
      loading.value = true;
      error.value = null;

      const docRef = doc($firebase.firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as T;
      }

      return null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addDocument = async <T = DocumentData>(
    collectionName: string,
    data: Omit<T, "id">
  ): Promise<string> => {
    try {
      loading.value = true;
      error.value = null;

      const docRef = await addDoc(
        collection($firebase.firestore, collectionName),
        data
      );
      return docRef.id;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDocument = async <T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const docRef = doc($firebase.firestore, collectionName, documentId);
      await updateDoc(docRef, data);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDocument = async (
    collectionName: string,
    documentId: string
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const docRef = doc($firebase.firestore, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Real-time listeners
  const subscribeToCollection = <T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    callback: (data: T[]) => void
  ) => {
    const q = query(
      collection($firebase.firestore, collectionName),
      ...constraints
    );

    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(data);
    });
  };

  const subscribeToDocument = <T = DocumentData>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void
  ) => {
    const docRef = doc($firebase.firestore, collectionName, documentId);

    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
        } as T;
        callback(data);
      } else {
        callback(null);
      }
    });
  };

  // Helper methods for common queries
  const whereQuery = (field: string, operator: string, value: any) =>
    where(field, operator as any, value);
  const orderByQuery = (field: string, direction: "asc" | "desc" = "asc") =>
    orderBy(field, direction);
  const limitQuery = (count: number) => limit(count);

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),

    // CRUD operations
    getCollection,
    getDocument,
    addDocument,
    updateDocument,
    deleteDocument,

    // Real-time listeners
    subscribeToCollection,
    subscribeToDocument,

    // Query helpers
    whereQuery,
    orderByQuery,
    limitQuery,

    // Utilities
    clearError,
  };
};
