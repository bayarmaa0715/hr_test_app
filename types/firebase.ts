import type { User, UserCredential } from "firebase/auth";
import type { DocumentData } from "firebase/firestore";

// Firebase plugin types
export interface FirebasePlugin {
  app: any;
  auth: any;
  firestore: any;
  analytics: any;
}

export interface FirebaseAdminPlugin {
  auth: any;
  firestore: any;
}

// Firestore types
export interface FirestoreState {
  loading: boolean;
  error: string | null;
}

export interface FirestoreMethods {
  getCollection: <T = DocumentData>(
    collectionName: string,
    constraints?: any[]
  ) => Promise<T[]>;
  getDocument: <T = DocumentData>(
    collectionName: string,
    documentId: string
  ) => Promise<T | null>;
  addDocument: <T = DocumentData>(
    collectionName: string,
    data: Omit<T, "id">
  ) => Promise<string>;
  updateDocument: <T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ) => Promise<void>;
  deleteDocument: (collectionName: string, documentId: string) => Promise<void>;
  subscribeToCollection: <T = DocumentData>(
    collectionName: string,
    constraints?: any[],
    callback?: (data: T[]) => void
  ) => () => void;
  subscribeToDocument: <T = DocumentData>(
    collectionName: string,
    documentId: string,
    callback?: (data: T | null) => void
  ) => () => void;
  whereQuery: (field: string, operator: string, value: any) => any;
  orderByQuery: (field: string, direction?: "asc" | "desc") => any;
  limitQuery: (count: number) => any;
  clearError: () => void;
}
