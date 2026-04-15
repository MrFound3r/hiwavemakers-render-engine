// app/components/dashboard/TemplatePreviewPanel.tsx
"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { TEMPLATE_OPTIONS } from "@/lib/dashboard/template-registry";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TemplatePreviewPanelProps {
  templateId: string;
}

export function TemplatePreviewPanel({
  templateId,
}: TemplatePreviewPanelProps) {
  const template =
    TEMPLATE_OPTIONS.find((item) => item.id === templateId) ??
    TEMPLATE_OPTIONS[0];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{template.label}</CardTitle>
        <CardDescription>
          Preview the visual style before sending.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-lg border bg-muted">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={template.previewImageUrl}
              alt={`${template.label} preview`}
              fill
              className="object-contain object-top"
            />
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <a
            href={template.previewUrl}
            target="_blank"
            className="inline-flex"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Full Preview
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}