"use client";

import { useMemo } from "react";
import type { Student } from "@/types/dashboard";
import {
  canRetryRender,
  getStatusLabel,
  getStatusTone,
  isRenderDone,
  isRenderProcessing,
} from "@/lib/dashboard/status";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentsTableProps {
  students: Student[];
  selectedStudentIds: Set<string>;
  allSelected: boolean;
  onToggleSelectAll: (checked: boolean) => void;
  onToggleStudent: (studentUuid: string, checked: boolean) => void;
  onRender: (student: Student) => void;
  onRetry: (student: Student) => void;
  onSendEmail: (student: Student) => void;
}

export function StudentsTable({
  students,
  selectedStudentIds,
  allSelected,
  onToggleSelectAll,
  onToggleStudent,
  onRender,
  onRetry,
  onSendEmail,
}: StudentsTableProps) {
  const someSelected = useMemo(() => {
    return selectedStudentIds.size > 0 && selectedStudentIds.size < students.length;
  }, [selectedStudentIds, students.length]);

  if (students.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center p-8 text-muted-foreground">
        No students joined this class yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-background">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="border-b bg-muted/30">
          <tr>
            <th className="w-12 px-4 py-3 text-left">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onToggleSelectAll(checked === true)}
                aria-label="Select all students"
              />
              {someSelected && !allSelected ? (
                <div className="mt-1 text-[10px] text-muted-foreground">Partial</div>
              ) : null}
            </th>
            <th className="px-4 py-3 text-left font-medium">Student</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Videos</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Progress</th>
            <th className="px-4 py-3 text-left font-medium">Error</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => {
            const isSelected = selectedStudentIds.has(student.student_uuid);
            const isDone = isRenderDone(student.render_status);
            const isProcessing = isRenderProcessing(student.render_status);
            const canRetry = canRetryRender(student.render_status);

            return (
              <tr
                key={student.student_uuid}
                className={cn("border-b transition-colors hover:bg-muted/20", isSelected && "bg-primary/5")}>
                <td className="px-4 py-3 align-middle">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onToggleStudent(student.student_uuid, checked === true)}
                    aria-label={`Select ${student.name}`}
                  />
                </td>

                <td className="px-4 py-3 align-middle">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{student.student_uuid.slice(0, 8)}...</div>
                </td>

                <td className="px-4 py-3 align-middle text-muted-foreground">{student.email || "—"}</td>

                <td className="px-4 py-3 align-middle">{student.videos?.length ?? 0}</td>

                <td className="px-4 py-3 align-middle">
                  <StatusPill status={student.render_status} />
                </td>

                <td className="px-4 py-3 align-middle text-muted-foreground">
                  {student.render_progress != null ? `${Math.round(student.render_progress * 100)}%` : "—"}
                </td>

                <td className="max-w-[260px] px-4 py-3 align-middle text-xs text-muted-foreground">
                  {student.render_error || "—"}
                </td>

                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-end gap-2">
                    {student.render_url ? (
                      <Button
                        variant="outline"
                        size="sm">
                        <a
                          href={student.render_url}
                          target="_blank"
                          rel="noopener noreferrer">
                          Watch Video
                        </a>
                      </Button>
                    ) : null}

                    {student.current_template_path ? (
                      <Button
                      variant="outline"
                        size="sm">
                        <a
                          href={student.current_template_path}
                          target="_blank"
                          rel="noopener noreferrer">
                          View Template
                        </a>
                      </Button>
                    ) : null}

                    {isProcessing ? (
                      <Button
                        size="sm"
                        disabled>
                        {student.render_status === "pending" ? "Pending..." : "Processing..."}
                      </Button>
                    ) : isDone ? (
                      <Button
                        size="sm"
                        onClick={() => onSendEmail(student)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Template
                      </Button>
                    ) : canRetry ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRetry(student)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onRender(student)}>
                        <Play className="mr-2 h-4 w-4" />
                        Render
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const tone = getStatusTone(status);
  const label = getStatusLabel(status);

  const className =
    tone === "success"
      ? "bg-green-100 text-green-700"
      : tone === "warning"
        ? "bg-yellow-100 text-yellow-800"
        : tone === "danger"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

  return <span className={cn("rounded-full px-2 py-1 text-xs font-medium", className)}>{label}</span>;
}
