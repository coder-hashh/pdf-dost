"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Image, X, GripVertical } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onReorder?: (files: FileItem[]) => void;
  sortable?: boolean;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  const imageExts = ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"];
  if (ext && imageExts.includes(ext)) {
    return Image;
  }
  return FileText;
}

function SortableItem({
  item,
  onRemove,
  sortable,
}: {
  item: FileItem;
  onRemove: (id: string) => void;
  sortable: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getFileIcon(item.name);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3 transition-shadow",
        isDragging && "z-50 shadow-lg ring-2 ring-primary/30",
        !isDragging && "hover:shadow-sm"
      )}
    >
      {sortable && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(item.size)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export function FileList({
  files,
  onRemove,
  onReorder,
  sortable = false,
}: FileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemIds = useMemo(() => files.map((f) => f.id), [files]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      const oldIndex = files.findIndex((f) => f.id === active.id);
      const newIndex = files.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(files, oldIndex, newIndex);
      onReorder(reordered);
    }
  }

  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        {files.length} file{files.length !== 1 ? "s" : ""} selected
        {sortable && files.length > 1 && " — drag to reorder"}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            <div className="space-y-2">
              {files.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  sortable={sortable}
                />
              ))}
            </div>
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </div>
  );
}
