// apps/web/components/dashboard/DashboardHeader.tsx
"use client";

import { Mail, RefreshCw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Student } from "@/types/dashboard";
import { POLL_INTERVAL_MS } from "@/lib/consts";

interface DashboardHeaderProps {
  selectedRoom: string | null;
  students: Student[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onRenderWholeClass: () => void;
  onEmailWholeClass: () => void;
  emailableWholeClassCount?: number;
  isSendingBulkEmail?: boolean;
  hasActiveRenders?: boolean;
  pollIntervalMs?: number;
}

export function DashboardHeader({
  selectedRoom,
  students,
  isRefreshing,
  onRefresh,
  onRenderWholeClass,
  onEmailWholeClass,
  emailableWholeClassCount = 0,
  isSendingBulkEmail = false,
  hasActiveRenders = false,
  pollIntervalMs = POLL_INTERVAL_MS,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold">{selectedRoom ? "Students in Class" : "Class Dashboard"}</h2>
        {selectedRoom ? (
          <p className="mt-1 text-sm text-muted-foreground font-mono">{selectedRoom}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Select a class to manage renders and delivery.</p>
        )}

        {selectedRoom && hasActiveRenders ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Auto-refreshing every {Math.round(pollIntervalMs / 1000)} seconds while renders are active.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={!selectedRoom || isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Status"}
        </Button>

        <Button
          onClick={onRenderWholeClass}
          disabled={!selectedRoom || students.length === 0}>
          <Video className="mr-2 h-4 w-4" />
          Render Whole Class
        </Button>

        <Button
          variant="secondary"
          onClick={onEmailWholeClass}
          disabled={!selectedRoom || emailableWholeClassCount === 0 || isSendingBulkEmail}>
          <Mail className="mr-2 h-4 w-4" />
          {isSendingBulkEmail ? "Sending..." : "Email Whole Class"}
        </Button>
      </div>
    </div>
  );
}
