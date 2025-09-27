export interface TreeNodeType {
  id: string;
  value: string;
  label: string;
  children: TreeNodeType[];
  readOnly?: boolean;
  isLast?: boolean;
}
