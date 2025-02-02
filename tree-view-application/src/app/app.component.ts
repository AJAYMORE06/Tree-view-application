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
  public treeData: TreeNode[] = []; // tree data
  public searchQuery = new Subject<string>(); //search query as a observable subject
  constructor(private readonly treeService: TreeService) { }

  public ngOnInit(): void {
    this.getRootNodes(); // for fetching root nodes
    this.searchQuery.pipe(debounceTime(300)).subscribe(query => {
      this.searchNodes(query);        // added debounce time to limit the invokation of events
    });
  }

  // Function to fetch root nodes
  public getRootNodes() {
    this.treeService.getRootNodes().subscribe({
      next: (rootNodes) => {
        this.treeData = rootNodes;
      }, error: (err) => console.log(err)
    });
  }

  // function to get invoked on event emission of search bar and passing data to subject
  public onSearch(event: any) {
    this.searchQuery.next(event.target.value);
  }

  // search the nodes from the mock data and display the filtered highlighted data
  public searchNodes(query: string): void {
    if (!query) {     // if query is empty or search bar is empty, reset the tree where we left
      this.treeData=[];
      this.getRootNodes();
    }
    const searchTerm = query.toLowerCase();
    this.treeService.searchQuery(searchTerm).subscribe((item) => {
      this.treeData = item.map(item => this.expandNode(item));  // assigning the returned filtered highlighted text
    });
  }

  public trackBy(index: number, node: TreeNode): string {
    return node.id;  // Using the unique id of each node to track the items
  }

  // to expand the nodes and their respective children explicitly
  private expandNode(node: TreeNode): TreeNode {
    return {
      ...node, // Keep other properties unchanged
      isExpanded: true, // Expand the node
      children: node.children ? node.children.map(child => this.expandNode(child)) : [] // Recursively expand children
    };
  }
}
