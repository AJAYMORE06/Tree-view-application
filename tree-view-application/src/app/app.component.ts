import { Component, OnInit } from '@angular/core';
import { TreeService } from './tree.service';
import { TreeNode } from './tree.model';
import { debounceTime, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public treeData: TreeNode[] = [];
  public searchQuery = new Subject<string>();
  constructor(private readonly treeService: TreeService) { }

  public ngOnInit(): void {
    this.getRootNodes();
    this.searchQuery.pipe(debounceTime(300)).subscribe(query => {
      this.searchNodes(query);
    });
  }

  public getRootNodes() {
    this.treeService.getRootNodes().subscribe({
      next: (rootNodes) => {
        this.treeData = rootNodes;
      }, error: (err) => console.log(err)
    });
  }

  public onSearch(event: any) {
    this.searchQuery.next(event.target.value);
  }

  public searchNodes(query: string): void {
    if (!query) {
      this.treeData=[];
      this.getRootNodes();
    }
    const searchTerm = query.toLowerCase();
    this.treeService.searchQuery(searchTerm).subscribe((item) => {
      this.treeData = item.map(item => this.expandNode(item));;
    });
  }

  public trackBy(index: number, node: TreeNode): string {
    return node.id;  // Using the unique id of each node to track the items
  }

  private expandNode(node: TreeNode): TreeNode {
    return {
      ...node, // Keep other properties unchanged
      isExpanded: true, // Expand the node
      children: node.children ? node.children.map(child => this.expandNode(child)) : [] // Recursively expand children
    };
  }
}
