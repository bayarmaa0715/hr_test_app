export interface Employee {
  id: string;
  userProfileId: string;
  positionId: string;
  hireDate: Date;
  salary: number;
  locationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  name: string;
  departmentId: string;
  managerId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "manager" | "employee";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Location {
  id: string; // unique ID
  city: string; // Хот
  country: string; // ISO 3166-1 код (MN, US)
  latitude?: number; // Latitude
  longitude?: number; // Longitude
  createdAt: Date;
  updatedAt: Date;
}
