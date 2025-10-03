// hooks/useSelection.ts
import { useCallback, useMemo, useState } from 'react';

interface UseSelectionProps<T = string> {
  initialItems?: T[];
  multiSelect?: boolean;
}

interface UseSelectionReturn<T = string> {
  selectedItems: T[];
  isSelected: (item: T) => boolean;
  toggleSelection: (item: T) => void;
  selectItem: (item: T) => void;
  deselectItem: (item: T) => void;
  clearSelection: () => void;
  selectMultiple: (items: T[]) => void;
  isInSelection: boolean;
  selectedCount: number;
  hasSelectedItems: boolean;
  selectUnselectItem: (item: T) => void;
}

export const useSelection = <T = string>({
  initialItems = [],
  multiSelect = true,
}: UseSelectionProps<T> = {}): UseSelectionReturn<T> => {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialItems);
  const [isInSelection, setIsInSelection] = useState<boolean>(false);

  const isSelected = useCallback((item: T): boolean => {
    return selectedItems.includes(item);
  }, [selectedItems]);

  const toggleSelection = useCallback((item: T): void => {
    setSelectedItems(prev => {
      let nextSelectedItems;

      if (prev.includes(item)) {
        nextSelectedItems = prev.filter(i => i !== item);
      } else {
        if (multiSelect) {
          nextSelectedItems = [...prev, item];
        } else {
          nextSelectedItems = [item];
        }
      }
      const willHaveItems = nextSelectedItems.length > 0;
      setIsInSelection(willHaveItems);

      return nextSelectedItems;
    });
  }, [multiSelect]);

  const selectUnselectItem = useCallback((item: T): void => {
    setSelectedItems(prev => {
      if (multiSelect) {
        return prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item];
      } else {
        return [item];
      }
    });
    setIsInSelection(true);
  }, [multiSelect]);

  const selectItem = useCallback((item: T): void => {
    setSelectedItems(prev => {
      if (multiSelect) {
        return prev.includes(item) ? prev : [...prev, item];
      } else {
        return [item];
      }
    });
    setIsInSelection(true);
  }, [multiSelect]);

  const deselectItem = useCallback((item: T): void => {
    setSelectedItems(prev => prev.filter(i => i !== item));

    // If no items left, exit selection mode
    if (selectedItems.length === 1 && selectedItems[0] === item) {
      setIsInSelection(false);
    }
  }, [selectedItems.length]);

  const clearSelection = useCallback((): void => {
    setSelectedItems([]);
    setIsInSelection(false);
  }, []);

  const selectMultiple = useCallback((items: T[]): void => {
    if (!multiSelect && items.length > 0) {
      // For single select, just take the first item
      setSelectedItems([items[0]]);
    } else {
      setSelectedItems(items);
    }
    setIsInSelection(items.length > 0);
  }, [multiSelect]);

  const selectedCount = useMemo(() => selectedItems.length, [selectedItems]);
  const hasSelectedItems = useMemo(() => selectedItems.length > 0, [selectedItems]);

  return {
    selectedItems,
    isSelected,
    toggleSelection,
    selectItem,
    deselectItem,
    clearSelection,
    selectMultiple,
    isInSelection,
    selectedCount,
    hasSelectedItems,
    selectUnselectItem,
  };
};

// Optional: Create a specialized version for string IDs
export const useIdSelection = (props?: Omit<UseSelectionProps<string>, 'initialItems'>) => {
  return useSelection<string>(props);
};