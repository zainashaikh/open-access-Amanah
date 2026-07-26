import React from "react";
import { useOutletContext } from "react-router-dom";
import CoachPanel from "@/components/coach/CoachPanel";

export default function GoalsChatbot() {
  const { user, profile } = useOutletContext();
  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-9rem)]">
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden h-full">
        <CoachPanel user={user} profile={profile} mode="inline" />
      </div>
    </div>
  );
}
