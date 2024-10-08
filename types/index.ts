import { Notification, App, Request, UserRole } from "@prisma/client";

export enum StatusTypes {
  OPEN = "OPEN",
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  COMPLETE = "COMPLETE",
}

export interface GroupItem {
  id: number;
  maxMembers: number;
  groupNumber: number;
  status: StatusTypes;
  users: {
    id: string;
    email: string;
    avatar: string;
    name: string;
    role: UserRole;
    lastActiveAt?: string;
  }[];
  becameTesterNumber: number;
  startedTestDate: string | null;
  notifications: Notification[];
  apps: App[];
  confirmRequests: Request[];
  ownerId?: string;
}

export enum GroupActions {
  JOIN = "join",
  LEAVE = "leave",
}
