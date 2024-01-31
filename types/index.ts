export type StatusTypes = "open" | "become a tester" | "inprogress" | "complete";

export interface GroupItem {
  id: number;
  maxMembers: number;
  status: StatusTypes;
  members: string[];
  becameTesterNumber: number;
  startedTestDate: string | null;
}
