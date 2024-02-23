"use client";

import { UserProfile } from "@/components/user-profile";
import { useCurrentUser } from "@/hooks/use-current-user";

const ProfilePage = () => {
  const user = useCurrentUser();

  return <UserProfile label="🤖 Profile" user={user} />;
};

export default ProfilePage;
