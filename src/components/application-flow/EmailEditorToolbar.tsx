'use client';

import React from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmailEditorToolbarProps {
  onRegenerate: () => void;
  onSaveDraft: () => void;
  isRegenerating: boolean;
  isSavingDraft: boolean;
}

export const EmailEditorToolbar: React.FC<EmailEditorToolbarProps> = ({
  onRegenerate,
  onSaveDraft,
  isRegenerating,
  isSavingDraft,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onRegenerate}
        isLoading={isRegenerating}
        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
      >
        Regenerate
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onSaveDraft}
        isLoading={isSavingDraft}
        leftIcon={<Save className="w-3.5 h-3.5" />}
      >
        Save Draft
      </Button>
    </div>
  );
};
