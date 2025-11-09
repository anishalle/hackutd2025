export type UserRole = "admin" | "technician" | "supervisor" | "engineer";

export type HealthCondition = {
  name: string;
  severity: "mild" | "moderate" | "severe";
  affectsPhysicalWork?: boolean;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  occupation: string;
  region: string;
  department: string;
  phoneNumber?: string;
  
  // Health information
  age: number;
  height: string; // e.g., "5'10"" or "178cm"
  weight: string; // e.g., "165 lbs" or "75 kg"
  bloodType?: string;
  healthConditions: HealthCondition[];
  allergies?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Work preferences
  shiftPreference?: string;
  certifications?: string[];
  
  // Profile metadata
  profileImage?: string;
  joinedDate: string;
  lastActive: string;
};

export type ProfileFormData = Partial<UserProfile>;

