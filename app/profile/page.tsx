"use client";

import { useState } from "react";
import { useProfile } from "@/contexts/profile-context";
import { getUserInitials } from "@/lib/profile/data";
import type { HealthCondition, UserRole } from "@/lib/profile/types";

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const initials = getUserInitials(profile);

  const handleSave = () => {
    updateProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const addHealthCondition = () => {
    setEditedProfile({
      ...editedProfile,
      healthConditions: [
        ...editedProfile.healthConditions,
        { name: "", severity: "mild", affectsPhysicalWork: false },
      ],
    });
  };

  const updateHealthCondition = (
    index: number,
    updates: Partial<HealthCondition>
  ) => {
    const newConditions = [...editedProfile.healthConditions];
    newConditions[index] = { ...newConditions[index]!, ...updates };
    setEditedProfile({ ...editedProfile, healthConditions: newConditions });
  };

  const removeHealthCondition = (index: number) => {
    setEditedProfile({
      ...editedProfile,
      healthConditions: editedProfile.healthConditions.filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <div className="min-h-screen bg-[#01040b] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        {/* Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl font-bold text-white shadow-[0_0_40px_rgba(14,165,233,0.8)]">
                {initials}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">
                  User Profile
                </p>
                <h1 className="text-4xl font-semibold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="mt-2 text-base text-white/70">
                  {profile.occupation} · {profile.department}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(14,165,233,0.4)] transition hover:from-cyan-500 hover:to-blue-500"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] transition hover:from-emerald-500 hover:to-cyan-500"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Personal Information */}
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_45px_-15px_rgba(14,165,233,0.6)]">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold text-white">
              Personal Information
            </h2>
            <p className="text-sm text-white/60">
              Basic details and contact information
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoField
              label="First Name"
              value={isEditing ? editedProfile.firstName : profile.firstName}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, firstName: value })
              }
            />
            <InfoField
              label="Last Name"
              value={isEditing ? editedProfile.lastName : profile.lastName}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, lastName: value })
              }
            />
            <InfoField
              label="Email"
              value={isEditing ? editedProfile.email : profile.email}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, email: value })
              }
            />
            <InfoField
              label="Phone Number"
              value={
                isEditing
                  ? editedProfile.phoneNumber
                  : profile.phoneNumber || "—"
              }
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, phoneNumber: value })
              }
            />
            <SelectField
              label="Role"
              value={isEditing ? editedProfile.role : profile.role}
              options={["admin", "technician", "supervisor", "engineer"]}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, role: value as UserRole })
              }
            />
            <InfoField
              label="Occupation"
              value={isEditing ? editedProfile.occupation : profile.occupation}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, occupation: value })
              }
            />
            <InfoField
              label="Department"
              value={isEditing ? editedProfile.department : profile.department}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, department: value })
              }
            />
            <InfoField
              label="Region"
              value={isEditing ? editedProfile.region : profile.region}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, region: value })
              }
            />
          </div>
        </section>

        {/* Health Information */}
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_45px_-15px_rgba(14,165,233,0.6)]">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold text-white">
              Health Information
            </h2>
            <p className="text-sm text-white/60">
              Medical details for work safety and task assignment optimization
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoField
              label="Age"
              value={
                isEditing ? editedProfile.age.toString() : profile.age.toString()
              }
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, age: parseInt(value) || 0 })
              }
            />
            <InfoField
              label="Blood Type"
              value={
                isEditing
                  ? editedProfile.bloodType
                  : profile.bloodType || "—"
              }
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, bloodType: value })
              }
            />
            <InfoField
              label="Height"
              value={isEditing ? editedProfile.height : profile.height}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, height: value })
              }
            />
            <InfoField
              label="Weight"
              value={isEditing ? editedProfile.weight : profile.weight}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, weight: value })
              }
            />
          </div>

          {/* Health Conditions */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                Health Conditions
              </h3>
              {isEditing && (
                <button
                  onClick={addHealthCondition}
                  className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/30"
                >
                  + Add Condition
                </button>
              )}
            </div>

            {(isEditing ? editedProfile : profile).healthConditions.length ===
            0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                No health conditions recorded
              </p>
            ) : (
              <div className="space-y-3">
                {(isEditing
                  ? editedProfile
                  : profile
                ).healthConditions.map((condition, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="text"
                            value={condition.name}
                            onChange={(e) =>
                              updateHealthCondition(idx, {
                                name: e.target.value,
                              })
                            }
                            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-cyan-400/50 focus:outline-none"
                            placeholder="Condition name"
                          />
                          <button
                            onClick={() => removeHealthCondition(idx)}
                            className="rounded-xl border border-rose-400/40 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/30"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <select
                            value={condition.severity}
                            onChange={(e) =>
                              updateHealthCondition(idx, {
                                severity: e.target.value as
                                  | "mild"
                                  | "moderate"
                                  | "severe",
                              })
                            }
                            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                          >
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                          <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={condition.affectsPhysicalWork || false}
                              onChange={(e) =>
                                updateHealthCondition(idx, {
                                  affectsPhysicalWork: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded accent-cyan-500"
                            />
                            <span className="text-sm text-white">
                              Affects physical work
                            </span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {condition.name}
                          </p>
                          <p className="text-xs text-white/60">
                            Severity: {condition.severity}
                            {condition.affectsPhysicalWork &&
                              " · Affects physical work"}
                          </p>
                        </div>
                        {condition.affectsPhysicalWork && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                            ⚠ Physical Impact
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergies & Medications */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                Allergies
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.allergies?.join(", ") || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      allergies: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-cyan-400/50 focus:outline-none"
                  placeholder="Separate with commas"
                  rows={3}
                />
              ) : (
                <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                  {profile.allergies?.join(", ") || "None"}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                Medications
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.medications?.join(", ") || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      medications: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-cyan-400/50 focus:outline-none"
                  placeholder="Separate with commas"
                  rows={3}
                />
              ) : (
                <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                  {profile.medications?.join(", ") || "None"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_45px_-15px_rgba(14,165,233,0.6)]">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold text-white">
              Emergency Contact
            </h2>
            <p className="text-sm text-white/60">
              Person to contact in case of emergency
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <InfoField
              label="Name"
              value={
                isEditing
                  ? editedProfile.emergencyContact?.name
                  : profile.emergencyContact?.name || "—"
              }
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({
                  ...editedProfile,
                  emergencyContact: {
                    ...(editedProfile.emergencyContact || {
                      name: "",
                      phone: "",
                      relationship: "",
                    }),
                    name: value,
                  },
                })
              }
            />
            <InfoField
              label="Phone"
              value={
                isEditing
                  ? editedProfile.emergencyContact?.phone
                  : profile.emergencyContact?.phone || "—"
              }
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({
                  ...editedProfile,
                  emergencyContact: {
                    ...(editedProfile.emergencyContact || {
                      name: "",
                      phone: "",
                      relationship: "",
                    }),
                    phone: value,
                  },
                })
              }
            />
            <InfoField
              label="Relationship"
              value={
                isEditing
                  ? editedProfile.emergencyContact?.relationship
                  : profile.emergencyContact?.relationship || "—"
              }
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({
                  ...editedProfile,
                  emergencyContact: {
                    ...(editedProfile.emergencyContact || {
                      name: "",
                      phone: "",
                      relationship: "",
                    }),
                    relationship: value,
                  },
                })
              }
            />
          </div>
        </section>

        {/* Work Information */}
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_45px_-15px_rgba(14,165,233,0.6)]">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold text-white">
              Work Information
            </h2>
            <p className="text-sm text-white/60">
              Certifications and preferences
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoField
              label="Shift Preference"
              value={
                isEditing
                  ? editedProfile.shiftPreference
                  : profile.shiftPreference || "—"
              }
              isEditing={isEditing}
              onChange={(value) =>
                setEditedProfile({ ...editedProfile, shiftPreference: value })
              }
            />
            <InfoField
              label="Member Since"
              value={new Date(profile.joinedDate).toLocaleDateString()}
              isEditing={false}
              onChange={() => {}}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
              Certifications
            </label>
            {isEditing ? (
              <textarea
                value={editedProfile.certifications?.join("\n") || ""}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    certifications: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-cyan-400/50 focus:outline-none"
                placeholder="One certification per line"
                rows={4}
              />
            ) : (
              <div className="space-y-2">
                {profile.certifications && profile.certifications.length > 0 ? (
                  profile.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white"
                    >
                      <svg
                        className="h-5 w-5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      {cert}
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                    No certifications listed
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  isEditing,
  onChange,
}: {
  label: string;
  value: string | undefined;
  isEditing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-cyan-400/50 focus:outline-none"
        />
      ) : (
        <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  isEditing,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  isEditing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
        {label}
      </label>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white capitalize focus:border-cyan-400/50 focus:outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option} className="capitalize">
              {option}
            </option>
          ))}
        </select>
      ) : (
        <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white capitalize">
          {value}
        </p>
      )}
    </div>
  );
}

