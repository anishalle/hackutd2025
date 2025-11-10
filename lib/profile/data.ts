import type { UserProfile } from "./types";

export const defaultProfile: UserProfile = {
  id: "user-001",
  firstName: "Jordan",
  lastName: "Martinez",
  email: "jordan.martinez@dcdaddy.us",
  role: "technician",
  occupation: "Senior Field Technician",
  region: "US-South",
  department: "Data Center Operations",
  phoneNumber: "+1 (512) 555-0142",
  age: 42,
  height: "5'11\"",
  weight: "185 lbs",
  bloodType: "O+",
  healthConditions: [
    {
      name: "Knee Pain (Left)",
      severity: "moderate",
      affectsPhysicalWork: true,
    },
    {
      name: "Mild Arthritis",
      severity: "mild",
      affectsPhysicalWork: true,
    },
  ],
  allergies: ["Dust mites"],
  medications: ["Ibuprofen as needed"],
  emergencyContact: {
    name: "Maria Martinez",
    phone: "+1 (512) 555-0199",
    relationship: "Spouse",
  },
  shiftPreference: "Day (6AM-2PM)",
  certifications: [
    "OSHA Safety Certified",
    "Fiber Optics Specialist",
    "NVIDIA DGX Certified",
    "Data Center Technician Level 3",
  ],
  joinedDate: "2019-03-15",
  lastActive: new Date().toISOString(),
};

export function hasPhysicalLimitations(profile: UserProfile): boolean {
  return profile.healthConditions.some(
    (condition) => condition.affectsPhysicalWork && condition.severity !== "mild",
  );
}

export function getUserInitials(profile: UserProfile): string {
  return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
}

export function getFullName(profile: UserProfile): string {
  return `${profile.firstName} ${profile.lastName}`;
}

export function isPhysicallyDemandingFloor(floor: string | undefined): boolean {
  if (!floor) return false;
  const floorUpper = floor.toUpperCase();
  return (
    floorUpper.includes("L2") ||
    floorUpper.includes("L3") ||
    floorUpper.includes("FLOOR 2") ||
    floorUpper.includes("FLOOR 3") ||
    floorUpper.includes("2ND") ||
    floorUpper.includes("3RD") ||
    /\b[23]F\b/i.test(floorUpper)
  );
}
