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
  age: number;
  height: string;
  weight: string;
  bloodType?: string;
  healthConditions: HealthCondition[];
  allergies?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  shiftPreference?: string;
  certifications?: string[];
  profileImage?: string;
  joinedDate: string;
  lastActive: string;
};

export type ProfileFormData = Partial<UserProfile>;
