// navigation.types.ts
// Shared types for the navigation store slices. Kept in their own file so
// no store module has to import from another store module just to get a type.

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export type TabItem = {
  id: string;
  label: string;
  path: string;
  closable?: boolean;
  icon?: string;
};

export type CommandItem = {
  id: string;
  label: string;
  category: string;
  shortcut?: string[];
  action: () => void;
};
