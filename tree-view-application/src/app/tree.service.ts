import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, map, retry, throwError, switchMap, retryWhen, scan, ObservableInput } from 'rxjs';
import { TreeNode } from './tree.model';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private cache: Map<string, TreeNode[]> = new Map(); // FOR CACHE CONTROL
  constructor() { }

  // mock data containing single source for parent, child and subchildren. We can keep them separately as well.
  public mockTreeData: TreeNode[] = [
    { id: '1', name: 'Root 1', childCount: 3, parentId: '-1', isExpanded: false, isLoading: false, isSelected: false },
    { id: '2', name: 'Root 2', childCount: 2, parentId: '-1', isExpanded: false, isLoading: false, isSelected: false },
    { id: '1-1', name: 'Child 1-1', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: false },
    { id: '1-2', name: 'Child 1-2', childCount: 2, parentId: '1', isExpanded: false, isLoading: false, isSelected: false },
    { id: '1-3', name: 'Child 1-3', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: false },
    { id: '2-1', name: 'Child 2-1', childCount: 0, parentId: '2', isExpanded: false, isLoading: false, isSelected: false },
    { id: '2-2', name: 'Child 2-2', childCount: 0, parentId: '2', isExpanded: false, isLoading: false, isSelected: false },
    { id: '1-2-1', name: 'Grandchild 1-2-1', childCount: 0, parentId: '1-2', isExpanded: false, isLoading: false, isSelected: false },
    { id: '1-2-2', name: 'Grandchild 1-2-2', childCount: 1, parentId: '1-2', isExpanded: false, isLoading: false, isSelected: false },
    { id: '1-2-2-1', name: 'Grandchild 1-2-2-1', childCount: 0, parentId: '1-2-2', isExpanded: false, isLoading: false, isSelected: false }
  ]

  // call for fetching root nodes. i.e parents with parentId = -1
  public getRootNodes(): Observable<TreeNode[]> {
    const rootNodes = this.mockTreeData.filter(node => node.parentId === '-1');
    return of(rootNodes).pipe(delay(this.getRandomDelay()), catchError(this.handleError));
  }

  // lazy loaded call for fetching child nodes according to the parent node id
  public getChildNodes(nodeId: string): Observable<TreeNode[]> {
    const mockChildData = this.mockTreeData.filter(node => node.parentId === nodeId); // filtering mock data as per parent Id

    // cache control - checking if data is present in cache or not, if data is present, then there is no need of an API call. We can get the data from saved cache.
    if (this.cache.has(nodeId)) {
      console.info("CACHE : Data is present in Cache")
      return of(this.cache.get(nodeId)!).pipe(
        delay(this.getRandomDelay()), // Adding delay to simulate network latency
        catchError(error => this.handleError(error))
      );
    }

    console.info("CACHE : Data not present in Cache")

    const randomFailure = Math.random() > 0.5;
    return (randomFailure // random failure scenario has been created to show error handeling and retry operation
      ? throwError(() => new Error(`Failed to fetch child nodes for parentId: ${nodeId}`))
      : of(mockChildData)).pipe(
        delay(this.getRandomDelay()), // Add a random delay before retrying
        retryWhen(errors =>
          errors.pipe(
            // Retry logic: retry 3 times with a delay
            scan((retryCount, error) => {
              if (retryCount >= 3) {
                throw error; // Stop retrying after 3 attempts
              }
              console.warn(`Retry attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(1000) // Delay before retrying
          )
        ),
        switchMap(result => {
          this.cache.set(nodeId, result); // Cache the data
          return of(result);
        }),
        catchError(error => this.handleError(error)) // Delay before retrying
      )
  }

  // Filtering the data on the basis of searched query
  public searchQuery(searchQuery: string): Observable<TreeNode[]> {
    if (!searchQuery.trim()) {
      // If search query is empty, return the full tree
      return of(this.mockTreeData);
    }
    const matchedNodes = new Set<TreeNode>();
    // Step 1: Find all matching nodes and collect their parents
    this.mockTreeData.forEach(node => {
      if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        matchedNodes.add(node);
        this.collectAllParents(node, matchedNodes);
      }
    });

    // Step 2: Build tree structure from the filtered data
    const filteredTree = this.filterAndHighlightNodes(searchQuery, this.buildTreeStructure(Array.from(matchedNodes)));
    return of(filteredTree);
  }

  //  Filters and highlights the nodes based on the search query
  private filterAndHighlightNodes(query: string, nodes: TreeNode[]): any[] {
    return nodes
      .map(node => {
        const match = node.name.toLowerCase().includes(query);
        const filteredChildren = node.children ? this.filterAndHighlightNodes(query, node.children) : [];

        if (match || filteredChildren.length > 0) {
          node.name = this.highlightText(node.name, query);
          node.children = filteredChildren;
          return node;
        }
        return null;
      })
      .filter(node => node !== null);
  }

  // Highlight the search query within the node's name
  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi'); // case-insensitive regex for search query
    return text.replace(regex, `<mark>$1</mark>`); // Wrap matching text with <mark> tag
  }

  // Recursively adds all parent nodes of a given node.
  private collectAllParents(node: TreeNode, matchedNodes: Set<TreeNode>) {
    if (!node || node.parentId === '-1') return;

    const parentNode = this.mockTreeData.find(n => n.id === node.parentId);
    if (parentNode && !matchedNodes.has(parentNode)) {
      matchedNodes.add(parentNode);
      this.collectAllParents(parentNode, matchedNodes); // Recursive call to get upper levels
    }
  }

  // Builds the hierarchical tree structure from a flat filtered list.
  private buildTreeStructure(flatNodes: TreeNode[]): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();
    const tree: TreeNode[] = [];

    // Step 1: Initialize a map with filtered nodes
    flatNodes.forEach(node => nodeMap.set(node.id, { ...node, children: [] }));

    // Step 2: Link children to their parents
    flatNodes.forEach(node => {
      if (node.parentId !== '-1') {
        const parentNode = nodeMap.get(node.parentId);
        if (parentNode) {
          parentNode.children!.push(nodeMap.get(node.id)!);
        }
      } else {
        // If it's a root node, add it to the tree
        tree.push(nodeMap.get(node.id)!);
      }
    });
    return tree;
  }


  // Handling API errors
  private handleError(error: any): Observable<never> {
    console.log(error)
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  // For random delay simulation
  private getRandomDelay(): number {
    return Math.floor(Math.random() * 500) + 500; // Random delay between 500ms - 1000ms
  }
}


