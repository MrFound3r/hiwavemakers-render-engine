"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Student } from "@/types/dashboard";
import {
  enqueueRenderForStudent,
  enqueueRenderForStudents,
  fetchStudentsByRoom,
} from "@/lib/dashboard/api";
import {
  canRetryRender,
  isRenderDone,
  isRenderProcessing,
} from "@/lib/dashboard/status";

interface UseStudentsOptions {
  pollIntervalMs?: number;
  enableAutoPolling?: boolean;
}

export type BulkRenderMode = "missing-only" | "rerender-all";

export function useStudents(
  selectedRoom: string | null,
  options: UseStudentsOptions = {},
) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isRefreshingStudents, setIsRefreshingStudents] = useState(false);

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(),
  );

  const { pollIntervalMs = 10000, enableAutoPolling = true } = options;

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadStudents = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (!selectedRoom) return;

      const isRefresh = options?.refresh === true;

      if (isRefresh) {
        setIsRefreshingStudents(true);
      } else {
        setIsLoadingStudents(true);
      }

      try {
        const data = await fetchStudentsByRoom(selectedRoom);
        setStudents(data);

        if (!isRefresh) {
          setSelectedStudentIds(new Set());
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        if (isRefresh) {
          setIsRefreshingStudents(false);
        } else {
          setIsLoadingStudents(false);
        }
      }
    },
    [selectedRoom],
  );

  useEffect(() => {
    if (!selectedRoom) return;
    loadStudents();
  }, [selectedRoom, loadStudents]);

  const refreshStudents = useCallback(async () => {
    await loadStudents({ refresh: true });
  }, [loadStudents]);

  const toggleStudentSelection = useCallback(
    (studentUuid: string, checked: boolean) => {
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);

        if (checked) {
          next.add(studentUuid);
        } else {
          next.delete(studentUuid);
        }

        return next;
      });
    },
    [],
  );

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedStudentIds(new Set(students.map((s) => s.student_uuid)));
      } else {
        setSelectedStudentIds(new Set());
      }
    },
    [students],
  );

  const markStudentStatus = useCallback(
    (studentUuid: string, partial: Partial<Student>) => {
      setStudents((prev) =>
        prev.map((student) =>
          student.student_uuid === studentUuid
            ? { ...student, ...partial }
            : student,
        ),
      );
    },
    [],
  );

  const markStudentsStatus = useCallback(
    (studentUuids: string[], partial: Partial<Student>) => {
      const targetIds = new Set(studentUuids);

      setStudents((prev) =>
        prev.map((student) =>
          targetIds.has(student.student_uuid)
            ? { ...student, ...partial }
            : student,
        ),
      );
    },
    [],
  );

  const applyQueuedRenderIds = useCallback(
    (studentUuids: string[], renderIds: string[]) => {
      const renderIdByStudentUuid = new Map(
        studentUuids.map((studentUuid, index) => [studentUuid, renderIds[index]]),
      );

      setStudents((prev) =>
        prev.map((student) => {
          const renderId = renderIdByStudentUuid.get(student.student_uuid);

          if (!renderId) return student;

          return {
            ...student,
            render_id: renderId,
            render_status: "pending",
            render_error: null,
            render_progress: 0,
          };
        }),
      );
    },
    [],
  );

  const renderStudent = useCallback(
    async (student: Student) => {
      try {
        markStudentStatus(student.student_uuid, {
          render_status: "pending",
          render_error: null,
          render_progress: 0,
        });

        const renderId = await enqueueRenderForStudent(student);

        markStudentStatus(student.student_uuid, {
          render_id: renderId,
          render_status: "pending",
          render_error: null,
          render_progress: 0,
        });
      } catch (error) {
        console.error("Render error:", error);
        markStudentStatus(student.student_uuid, {
          render_status: "failed",
          render_error:
            error instanceof Error ? error.message : "Failed to start render.",
        });
        throw error;
      }
    },
    [markStudentStatus],
  );

  const retryStudentRender = useCallback(
    async (student: Student) => {
      if (!canRetryRender(student.render_status)) return;
      await renderStudent(student);
    },
    [renderStudent],
  );

  const shouldRenderStudent = useCallback(
    (student: Student, mode: BulkRenderMode) => {
      if (isRenderProcessing(student.render_status)) return false;

      if (mode === "missing-only") {
        return !isRenderDone(student.render_status) || !student.render_url;
      }

      return true;
    },
    [],
  );

  const getRenderableStudents = useCallback(
    (scopeStudents: Student[], mode: BulkRenderMode) => {
      return scopeStudents.filter((student) =>
        shouldRenderStudent(student, mode),
      );
    },
    [shouldRenderStudent],
  );

  const enqueueBulkRender = useCallback(
    async (scopeStudents: Student[], mode: BulkRenderMode) => {
      const studentsToRender = getRenderableStudents(scopeStudents, mode);

      if (studentsToRender.length === 0) {
        return [];
      }

      const studentUuids = studentsToRender.map((student) => student.student_uuid);

      try {
        markStudentsStatus(studentUuids, {
          render_status: "pending",
          render_error: null,
          render_progress: 0,
        });

        const renderIds = await enqueueRenderForStudents(studentsToRender);

        applyQueuedRenderIds(studentUuids, renderIds);

        return studentsToRender;
      } catch (error) {
        console.error("Bulk render error:", error);

        markStudentsStatus(studentUuids, {
          render_status: "failed",
          render_error:
            error instanceof Error ? error.message : "Failed to start render.",
        });

        throw error;
      }
    },
    [getRenderableStudents, markStudentsStatus, applyQueuedRenderIds],
  );

  const renderSelectedStudents = useCallback(
    async (mode: BulkRenderMode = "missing-only") => {
      const selected = students.filter((student) =>
        selectedStudentIds.has(student.student_uuid),
      );

      return enqueueBulkRender(selected, mode);
    },
    [students, selectedStudentIds, enqueueBulkRender],
  );

  const renderWholeClass = useCallback(
    async (mode: BulkRenderMode = "missing-only") => {
      return enqueueBulkRender(students, mode);
    },
    [students, enqueueBulkRender],
  );

  const allSelected =
    students.length > 0 && selectedStudentIds.size === students.length;

  const hasActiveRenders = useMemo(() => {
    return students.some((student) => isRenderProcessing(student.render_status));
  }, [students]);

  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (!enableAutoPolling) return;
    if (!selectedRoom) return;
    if (!hasActiveRenders) return;

    pollingIntervalRef.current = setInterval(() => {
      loadStudents({ refresh: true });
    }, pollIntervalMs);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [
    enableAutoPolling,
    selectedRoom,
    hasActiveRenders,
    pollIntervalMs,
    loadStudents,
  ]);

  return {
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
  };
}