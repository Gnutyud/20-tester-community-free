import { Notification } from '@prisma/client';

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
  users: { id: string; email: string; avatar: string; name: string }[];
  becameTesterNumber: number;
  startedTestDate: string | null;
  notifications: Notification[];
}
