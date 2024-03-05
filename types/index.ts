export enum StatusTypes {
  OPEN = "OPEN",
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  COMPLETE = "COMPLETE",
}

export interface GroupItem {
  id: number;
  maxMembers: number;
  status: StatusTypes;
  users: string[];
  becameTesterNumber: number;
  startedTestDate: string | null;
}
