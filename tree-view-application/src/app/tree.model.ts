export interface TreeNode {
  id: string;
  name: string;
  childCount: number;
  parentId: string; // -1 for root node
  children?: TreeNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
  isSelected?: boolean; // added for keeping the track of selected status of a node
}