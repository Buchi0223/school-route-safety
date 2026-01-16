"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "エラーが発生しました",
  message,
  onRetry,
  className
}: ErrorMessageProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg",
      className
    )}>
      <AlertCircle className="h-8 w-8 text-red-500" />
      <div className="text-center">
        <p className="font-medium text-red-700">{title}</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 text-red-600 border-red-300 hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          再試行
        </Button>
      )}
    </div>
  );
}
