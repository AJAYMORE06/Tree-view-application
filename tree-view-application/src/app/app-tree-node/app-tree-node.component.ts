import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from '../tree.model';
import { TreeService } from '../tree.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tree-node',
  templateUrl: './app-tree-node.component.html',
  styleUrls: ['./app-tree-node.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0px',
        opacity: '0',
        overflow: 'hidden',
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class AppTreeNodeComponent {
  public errorMessage: string = ''; // Error message for any errors that occur
  @Input() node!: TreeNode; // Node for this component
  @Input() treeData!: TreeNode[]; // Full tree data
  @Output() loadChildren = new EventEmitter<any>(); // Event emitter to notify when children need to be loaded

  constructor(private treeService: TreeService) { }

  // Handle keyboard events for expanding/collapsing nodes (space or enter)
  public onKeydown(event: KeyboardEvent, node: TreeNode) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.node = node;
      this.toggleNode();
    }
  }

  // Toggle expand/collapse of the node
  public toggleNode() {
    if (this.node.childCount > 0) {
      this.node.isExpanded = !this.node.isExpanded; // Toggle expand/collapse state

      // If the node doesn't have children loaded yet, load them
      if (!this.node.children) {
        this.getChildNodes(this.node);
      }

      // If collapsing, delete children from the node
      if (!this.node.isExpanded) {
        delete this.node.children;
      }
    }
  }

  // Get child nodes from the TreeService
  public getChildNodes(eventNode: any) {
    this.node.isLoading = true; // Set loading state to true
    this.treeService.getChildNodes(eventNode.id).subscribe({
      next: (childnodes) => {
        this.errorMessage = ''; // Clear any previous error messages
        eventNode.children = childnodes; // Assign fetched children to the node
        if (eventNode.isSelected) {
          this.selectAllChildren(eventNode); // Select all children if the parent is selected
        }
        this.node.isLoading = false; // Set loading state to false
      },
      error: (err) => {
        this.errorMessage = `${err}`; // Show error message
        this.node.isLoading = false; // Set loading state to false
      }
    })
  }

  // Handle the selection of a node and propagate selection to children
  public onNodeSelect(node: TreeNode) {
    // If the node is selected, propagate selection to children
    if (node.isSelected) {
      this.selectAllChildren(node);
    } else {
      this.deselectAllChildren(node); // Deselect all children if the node is deselected
    }

    // Update the parent node's selection state based on the children's selection
    this.updateParentSelectionState(node);
  }

  // Recursively select all child nodes
  private selectAllChildren(node: TreeNode) {
    if (node.children) {
      node.children.forEach(child => {
        child.isSelected = true; // Mark each child as selected
        this.selectAllChildren(child); // Recursively select children's children
      });
    }
  }

  // Recursively deselect all child nodes
  private deselectAllChildren(node: TreeNode) {
    if (node.children) {
      node.children.forEach(child => {
        child.isSelected = false; // Mark each child as deselected
        this.deselectAllChildren(child); // Recursively deselect children's children
      });
    }
  }

  // Search through children and update selection state based on parentId
  private searchInChildren(node: TreeNode, parentId: string): void {
    if (node.children && node.children.length > 0) {
      const parentNode = node.children.find(child => child.id === parentId);

      if (parentNode) {
        parentNode.isSelected = this.checkAllChildrenSelected(parentNode);
        this.updateParentSelectionState(parentNode); // Update recursively
      } else {
        // If the parent isn't found, check recursively in the children's children
        node.children.forEach(child => this.searchInChildren(child, parentId));
      }
    }
  }

  // Check if all children of a node are selected
  private checkAllChildrenSelected(node: TreeNode): boolean {
    if (node.children) {
      return node.children.every(child => child.isSelected && this.checkAllChildrenSelected(child));
    }
    return true; // If no children, the node is considered "selected" by default
  }

  // Update the parent node's selection state based on children's selection
  private updateParentSelectionState(node: TreeNode) {
    if (node.parentId !== '-1') {
      const parentNode = this.treeData.find(n => n.id === node.parentId);
      if (parentNode) {
        parentNode.isSelected = this.checkAllChildrenSelected(parentNode);
        this.updateParentSelectionState(parentNode); // Update recursively
      } else {
        // If direct parent isn't found, recursively check in the children of each node in treeData
        this.treeData.forEach(n => {
          this.searchInChildren(n, node.parentId); // This function will check the children
        });
      }
    }
  }
}
