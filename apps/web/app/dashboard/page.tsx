"use client";

import { useMemo, useState } from "react";
import type { Student } from "@/types/dashboard";
import { BulkActionsBar } from "@/components/dashboard/BulkActionsBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RoomsSidebar } from "@/components/dashboard/RoomsSidebar";
import { SendEmailDialog } from "@/components/dashboard/SendEmailDialog";
import { StudentsTable } from "@/components/dashboard/StudentsTable";
import { useRooms } from "@/hooks/useRooms";
import { useStudents } from "@/hooks/useStudents";
import { POLL_INTERVAL_MS } from "@/lib/consts";

export default function DashboardPage() {
  const { rooms, isLoadingRooms } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const {
    students,
    selectedStudentIds,
    allSelected,
    isLoadingStudents,
    isRefreshingStudents,
    refreshStudents,
    toggleStudentSelection,
    toggleSelectAll,
    renderStudent,
    retryStudentRender,
    renderSelectedStudents,
    renderWholeClass,
    hasActiveRenders,
    pollIntervalMs,
    isSendingBulkEmail,
    emailableSelectedStudents,
    emailableWholeClassStudents,
    emailSelectedStudents,
    emailWholeClass,
  } = useStudents(selectedRoom, {
    enableAutoPolling: true,
    pollIntervalMs: POLL_INTERVAL_MS,
  });

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailStudent, setEmailStudent] = useState<Student | null>(null);

  const selectedCount = selectedStudentIds.size;

  const emptyMessage = useMemo(() => {
    if (!selectedRoom) return "Select a class from the sidebar to view students.";
    if (isLoadingStudents) return "Loading students...";
    return "";
  }, [selectedRoom, isLoadingStudents]);

  const openEmailDialog = (student: Student) => {
    setEmailStudent(student);
    setEmailDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <RoomsSidebar
        rooms={rooms}
        selectedRoom={selectedRoom}
        isLoading={isLoadingRooms}
        onSelectRoom={setSelectedRoom}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          selectedRoom={selectedRoom}
          students={students}
          isRefreshing={isRefreshingStudents}
          onRefresh={refreshStudents}
          onRenderWholeClass={renderWholeClass}
          onEmailWholeClass={emailWholeClass}
          emailableWholeClassCount={emailableWholeClassStudents.length}
          isSendingBulkEmail={isSendingBulkEmail}
          hasActiveRenders={hasActiveRenders}
          pollIntervalMs={pollIntervalMs}
        />

        <div className="flex-1 overflow-y-auto p-6">
          {!selectedRoom || isLoadingStudents ? (
            <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-4">
              <BulkActionsBar
                selectedCount={selectedStudentIds.size}
                emailableSelectedCount={emailableSelectedStudents.length}
                isSendingBulkEmail={isSendingBulkEmail}
                onClearSelection={() => toggleSelectAll(false)}
                onRenderSelected={renderSelectedStudents}
                onEmailSelected={emailSelectedStudents}
              />

              <StudentsTable
                students={students}
                selectedStudentIds={selectedStudentIds}
                allSelected={allSelected}
                onToggleSelectAll={toggleSelectAll}
                onToggleStudent={toggleStudentSelection}
                onRender={renderStudent}
                onRetry={retryStudentRender}
                onSendEmail={openEmailDialog}
              />
            </div>
          )}
        </div>
      </main>

      <SendEmailDialog
        open={emailDialogOpen}
        student={emailStudent}
        onOpenChange={(open) => {
          setEmailDialogOpen(open);
          if (!open) setEmailStudent(null);
        }}
      />
    </div>
  );
}
