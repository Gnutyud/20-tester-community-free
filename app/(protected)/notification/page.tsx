"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import axios from "axios";
import { useEffect, useState } from "react";
import { RocketIcon } from "@radix-ui/react-icons";

function Notification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    const response = await axios.get("/api/notification");
    console.log("Notifications", response.data);
    setNotifications(response.data);
  };

  return (
    <Container>
      <div className="my-8">
        <h1 className="text-2xl font-semibold mb-8">Notifications</h1>
        {notifications.map((notification) => (
          <Alert key={notification.id}>
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>{notification?.title}</AlertTitle>
            <AlertDescription>{notification?.message}</AlertDescription>
          </Alert>
        ))}
      </div>
    </Container>
  );
}

export default Notification;
