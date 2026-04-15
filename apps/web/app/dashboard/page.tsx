"use client";

import { useMemo, useState } from "react";
import type { Student } from "@/types/dashboard";
import { BulkActionsBar } from "@/components/dashboard/BulkActionsBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RoomsSidebar } from "@/components/dashboard/RoomsSidebar";
import { SendEmailDialog } from "@/components/dashboard/SendEmailDialog";
import { BulkEmailDialog } from "@/components/dashboard/BulkEmailDialog";
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
  } = useStudents(selectedRoom, {
    enableAutoPolling: true,
    pollIntervalMs: POLL_INTERVAL_MS,
  });

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailStudent, setEmailStudent] = useState<Student | null>(null);

  const [bulkEmailDialogOpen, setBulkEmailDialogOpen] = useState(false);
  const [wholeClassEmailDialogOpen, setWholeClassEmailDialogOpen] = useState(false);

  const selectedStudents = useMemo(
    () =>
      students.filter((student) =>
        selectedStudentIds.has(student.student_uuid)
      ),
    [students, selectedStudentIds]
  );

  const emptyMessage = useMemo(() => {
    if (!selectedRoom) return "Select a class from the sidebar to view students.";
    if (isLoadingStudents) return "Loading students...";
    return "";
  }, [selectedRoom, isLoadingStudents]);

  const openEmailDialog = (student: Student) => {
    setEmailStudent(student);
    setEmailDialogOpen(true);
  };

  const openBulkEmailDialog = () => {
    if (selectedStudents.length === 0) {
      alert("Select at least one student.");
      return;
    }

    setBulkEmailDialogOpen(true);
  };

  const openWholeClassEmailDialog = () => {
    if (students.length === 0) {
      alert("There are no students in this class.");
      return;
    }

    setWholeClassEmailDialogOpen(true);
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
          onEmailWholeClass={openWholeClassEmailDialog}
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
                onClearSelection={() => toggleSelectAll(false)}
                onRenderSelected={renderSelectedStudents}
                onEmailSelected={openBulkEmailDialog}
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
        onSent={refreshStudents}
      />

      <BulkEmailDialog
        open={bulkEmailDialogOpen}
        students={selectedStudents}
        onOpenChange={setBulkEmailDialogOpen}
        onSent={refreshStudents}
      />

      <BulkEmailDialog
        open={wholeClassEmailDialogOpen}
        students={students}
        wholeClass
        onOpenChange={setWholeClassEmailDialogOpen}
        onSent={refreshStudents}
      />
    </div>
  );
}