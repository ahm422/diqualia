import { maskCnic } from "@/lib/cnic";
import type { JobApplicationAdminView } from "@/lib/schemas/admin/career";

export const JOB_APPLICATION_ADMIN_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  jobOpeningId: true,
  jobTitle: true,
  coverNote: true,
  resumeKey: true,
  photoKey: true,
  status: true,
  submittedAt: true,
  fatherOrHusbandName: true,
  dateOfBirth: true,
  gender: true,
  maritalStatus: true,
  cnic: true,
  nationality: true,
  currentAddress: true,
  city: true,
  highestQualification: true,
  fieldOfStudy: true,
  institutionName: true,
  yearOfCompletion: true,
  yearsOfExperience: true,
  currentEmployer: true,
  currentJobTitle: true,
  keySkills: true,
  noticePeriodDays: true,
  expectedSalary: true,
  availableFrom: true,
  declarationAccepted: true,
} as const;

type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobOpeningId: number | null;
  jobTitle: string;
  coverNote: string | null;
  resumeKey: string;
  photoKey: string | null;
  status: string;
  submittedAt: Date;
  fatherOrHusbandName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  cnic: string | null;
  nationality: string | null;
  currentAddress: string | null;
  city: string | null;
  highestQualification: string | null;
  fieldOfStudy: string | null;
  institutionName: string | null;
  yearOfCompletion: number | null;
  yearsOfExperience: number | null;
  currentEmployer: string | null;
  currentJobTitle: string | null;
  keySkills: string | null;
  noticePeriodDays: number | null;
  expectedSalary: number | null;
  availableFrom: string | null;
  declarationAccepted: boolean;
};

export function toJobApplicationAdminView(
  row: ApplicationRow,
  canRevealPii: boolean,
): JobApplicationAdminView {
  return {
    ...row,
    cnicMasked: maskCnic(row.cnic),
    cnic: canRevealPii ? row.cnic : null,
  };
}
