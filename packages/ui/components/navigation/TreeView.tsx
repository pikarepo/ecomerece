/** @jsxImportSource react */
import { ChevronRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface TreeNode {
  id: string;
  label: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  /** IDs that start expanded. Uncontrolled. */
  defaultExpanded?: string[];
  className?: string;
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  selected: string | null | undefined;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (id: string) => void;
}

function TreeItem({ node, depth, selected, expanded, onToggle, onSelect }: TreeItemProps) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;

  const handleKey = (e: React.KeyboardEvent) => {
    if (node.disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hasChildren) onToggle(node.id);
      else onSelect?.(node.id);
    } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    }
  };

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: focus is on the inner button, not the li container
    <li
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-disabled={node.disabled || undefined}
    >
      <button
        type="button"
        tabIndex={node.disabled ? -1 : 0}
        disabled={node.disabled}
        onKeyDown={handleKey}
        onClick={() => {
          if (node.disabled) return;
          if (hasChildren) onToggle(node.id);
          else onSelect?.(node.id);
        }}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
        className={cn(
          'flex w-full cursor-pointer select-none items-center gap-1.5 rounded-control px-2 py-1.5 text-sm',
          'transition-colors duration-skin ease-skin',
          isSelected
            ? 'mat-raised font-medium text-ink'
            : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
          node.disabled && 'cursor-not-allowed opacity-50',
          focusRing(),
        )}
      >
        {hasChildren ? (
          <ChevronRight
            aria-hidden="true"
            className={cn(
              'size-3.5 shrink-0 text-ink-4 transition-transform duration-skin ease-skin',
              isExpanded && 'rotate-90',
            )}
          />
        ) : (
          <span className="size-3.5 shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">{node.label}</span>
      </button>
      {hasChildren && isExpanded && (
        // biome-ignore lint/a11y/useSemanticElements: role=group on ul is correct ARIA tree pattern
        <ul role="group">
          {(node.children ?? []).map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView({
  nodes,
  selected,
  onSelect,
  defaultExpanded = [],
  className,
}: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: role=tree on ul is the correct ARIA tree pattern
    <ul role="tree" className={cn('w-full', className)}>
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          selected={selected}
          expanded={expanded}
          onToggle={toggle}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
