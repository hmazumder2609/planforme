"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

function isEditableElement(element: Element | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }
  if (element instanceof HTMLElement && element.isContentEditable) {
    return true;
  }
  return false;
}

export function useKeyboardShortcuts() {
  const openTaskForm = useUiStore((s) => s.openTaskForm);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const isCommandPaletteOpen = useUiStore((s) => s.isCommandPaletteOpen);
  const goToPrevWeek = useUiStore((s) => s.goToPrevWeek);
  const goToNextWeek = useUiStore((s) => s.goToNextWeek);
  const goToCurrentWeek = useUiStore((s) => s.goToCurrentWeek);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const isTaskFormOpen = useUiStore((s) => s.isTaskFormOpen);
  const closeTaskForm = useUiStore((s) => s.closeTaskForm);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey;

      // Cmd/Ctrl+K: Toggle command palette (works even in inputs)
      if (isMetaOrCtrl && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      // Escape: Close any open dialog/form
      if (event.key === "Escape") {
        if (isCommandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (isTaskFormOpen) {
          closeTaskForm();
          return;
        }
        return;
      }

      // All remaining shortcuts should be ignored when in editable elements
      if (isEditableElement(document.activeElement)) return;

      switch (event.key) {
        case "n": {
          event.preventDefault();
          openTaskForm();
          break;
        }
        case "[": {
          event.preventDefault();
          goToPrevWeek();
          break;
        }
        case "]": {
          event.preventDefault();
          goToNextWeek();
          break;
        }
        case "t": {
          event.preventDefault();
          goToCurrentWeek();
          break;
        }
        case "b": {
          event.preventDefault();
          toggleSidebar();
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    openTaskForm,
    setCommandPaletteOpen,
    isCommandPaletteOpen,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
    toggleSidebar,
    isTaskFormOpen,
    closeTaskForm,
  ]);
}
