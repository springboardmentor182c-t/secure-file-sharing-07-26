import React from "react";
import NotificationList from "./components/NotificationList";

function NotificationFeature() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Notifications
        </h1>
        <p className="text-gray-500 mt-2">
          Stay updated with your file activities and security alerts.
        </p>
      </div>

      <NotificationList />
    </div>
  );
}

export default NotificationFeature;