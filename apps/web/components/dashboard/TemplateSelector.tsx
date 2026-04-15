"use client";

import { TEMPLATE_OPTIONS } from "@/lib/dashboard/template-registry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateSelector({
  value,
  onChange,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Template</label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (!nextValue) return;
          onChange(nextValue);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose a template" />
        </SelectTrigger>
        <SelectContent>
          {TEMPLATE_OPTIONS.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}