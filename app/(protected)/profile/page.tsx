"use client";

import { UserProfile } from "@/components/user-profile";
import { useCurrentUser } from "@/hooks/use-current-user";

const ProfilePage = () => {
  const user = useCurrentUser();

  return (
    <div className="my-8 flex justify-center">
      <UserProfile label="🤖 Profile" user={user} />
    </div>
  );
};

export default ProfilePage;
