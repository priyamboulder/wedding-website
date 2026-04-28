"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

export type NotificationType =
  | "inquiry_received"
  | "inquiry_viewed"
  | "inquiry_responded"
  | "inquiry_declined"
  | "inquiry_booked"
  | "review_received"
  | "workspace_update"
  | "message_received"
  // Drops
  | "drop_launch"
  | "drop_reminder_24h"
  | "drop_last_day"
  // Partnerships
  | "partnership_proposal"
  | "partnership_accepted"
  | "partnership_countered"
  | "partnership_declined"
  | "partnership_delivered"
  | "partnership_approved"
  | "partnership_message"
  // Creator applications
  | "application_received"
  | "application_approved"
  | "application_rejected"
  | "application_waitlisted"
  | "application_more_info"
  | "application_new_admin";

export type NotificationRecipient = "couple" | "vendor" | "planner" | "admin";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  actor_name: string;
  read: boolean;
  created_at: string;
  recipient: NotificationRecipient;
}

export type AddNotificationInput = Omit<Notification, "id" | "read" | "created_at">;

type NotificationsState = {
  notifications: Notification[];
  addNotification: (data: AddNotificationInput) => string;
  markRead: (id: string) => void;
  markAllRead: (recipient?: NotificationRecipient) => void;
  getUnread: (recipient?: NotificationRecipient) => Notification[];
  getByRecipient: (recipient: NotificationRecipient) => Notification[];
};

const genId = () =>
  `ntf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (data) => {
        const id = genId();
        const notification: Notification = {
          ...data,
          id,
          read: false,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ notifications: [notification, ...s.notifications] }));
        return id;
      },

      markRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }));
      },

      markAllRead: (recipient) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            !recipient || n.recipient === recipient ? { ...n, read: true } : n,
          ),
        }));
      },

      getUnread: (recipient) =>
        get().notifications.filter(
          (n) => !n.read && (!recipient || n.recipient === recipient),
        ),

      getByRecipient: (recipient) =>
        get().notifications.filter((n) => n.recipient === recipient),
    }),
    {
      name: "ananya-notifications",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    },
  ),
);

let _notificationsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useNotificationsStore.subscribe((state) => {
  if (_notificationsSyncTimer) clearTimeout(_notificationsSyncTimer);
  _notificationsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("couple_notifications", { couple_id: coupleId, notifications: state.notifications });
  }, 600);
});
