"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { Notification } from "@prisma/client";
import { RocketIcon } from "@radix-ui/react-icons";
import axios from "axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./loading";

function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    try {
      const response: { data: Notification[] } = await axios.get("/api/notification");
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleClickNotification = async (noti: Notification) => {
    try {
      axios.post("/api/notification", { id: noti.id });
    } catch (error) {
      console.log("Failed to update notification.");
    } finally {
      router.push(`/group/${noti.groupId}`);
    }
  };

  const makeAllAsRead = async () => {
    try {
      setLoading(true);
      const requests = notifications.map((noti) => axios.post("/api/notification", { id: noti.id }));
      await Promise.all(requests);
      setNotifications([]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Failed to update all notification.");
    }
  };

  return (
    <Container>
      <div className="my-8">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-semibold ">Notifications</h1>
          {notifications.length > 0 && (
            <button onClick={makeAllAsRead} className="bg-sky-500 text-white py-1 px-2 ml-4 rounded-md">
              Mark all as read
            </button>
          )}
        </div>

        {!loading &&
          notifications.length > 0 &&
          notifications.map((notification) => (
            <Alert
              key={notification.id}
              className="mb-4 cursor-pointer"
              onClick={() => handleClickNotification(notification)}
            >
              <RocketIcon className="h-4 w-4" />
              <AlertTitle>{`${dayjs(notification.createdAt).format("MMM D, YYYY h:mm A")} - ${
                notification.title
              }`}</AlertTitle>
              <AlertDescription>{notification?.message}</AlertDescription>
            </Alert>
          ))}
        {loading && <Loading />}
        {!loading && notifications.length === 0 && (
          <Alert>
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>No notifications!</AlertTitle>
            <AlertDescription>You can see all notifications by check email from 20 Tester Community.</AlertDescription>
          </Alert>
        )}
      </div>
    </Container>
  );
}

export default NotificationPage;
