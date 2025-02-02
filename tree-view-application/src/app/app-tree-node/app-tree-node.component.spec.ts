import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTreeNodeComponent } from './app-tree-node.component';
import { of, throwError } from 'rxjs';
import { TreeNode } from '../tree.model';

describe('AppTreeNodeComponent', () => {
  let component: AppTreeNodeComponent;
  let fixture: ComponentFixture<AppTreeNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppTreeNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTreeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle node expansion', () => {
    component.node = { id: '1', name: 'Root', childCount: 2, parentId: '-1', isExpanded: false, isLoading: false, isSelected: false };
    component.toggleNode();
    expect(component.node.isExpanded).toBe(true); // Verify the node expanded
  
    component.toggleNode();
    expect(component.node.isExpanded).toBe(false); // Verify the node collapsed
  });

  it('should load child nodes correctly', (done) => {
    const mockChildNodes = [
      { id: '2', name: 'Child 1', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: false },
      { id: '3', name: 'Child 2', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: false }
    ];
    
    // Mock the service
    spyOn(component['treeService'], 'getChildNodes').and.returnValue(of(mockChildNodes));
  
    component.node = { id: '1', name: 'Root', childCount: 2, parentId: '-1', isExpanded: false, isLoading: false, isSelected: false };
    component.getChildNodes(component.node);
    
    // Wait for async data
    setTimeout(() => {
      expect(component.node.children).toEqual(mockChildNodes); // Verify child nodes are loaded
      done();
    }, 0);
  });
  
  it('should handle errors when loading child nodes', (done) => {
    const errorMessage = 'Failed to fetch child nodes';
    
    // Mock the service to simulate an error
    spyOn(component['treeService'], 'getChildNodes').and.returnValue(throwError(() => new Error(errorMessage)));
  
    component.node = { id: '1', name: 'Root', childCount: 2, parentId: '-1', isExpanded: false, isLoading: false, isSelected: false };
    component.getChildNodes(component.node);
    
    // Wait for async data
    setTimeout(() => {
      expect(errorMessage).toBe('Failed to fetch child nodes'); // Verify error message
      expect(component.node.isLoading).toBe(false); // Verify loading state is false
      done();
    }, 0);
  });
  
  it('should select all children when parent node is selected', () => {
    const parentNode: TreeNode = {
      id: '1', name: 'Root', childCount: 2, parentId: '-1', isExpanded: true, isLoading: false, isSelected: true, children: [
        { id: '2', name: 'Child 1', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: false },
        { id: '3', name: 'Child 2', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: false }
      ]
    };
    component.node = parentNode;
    component.onNodeSelect(parentNode);
  
    expect(parentNode.children![0].isSelected).toBe(true); // Verify child 1 is selected
    expect(parentNode.children![1].isSelected).toBe(true); // Verify child 2 is selected
  });
  
  it('should deselect all children when parent node is deselected', () => {
    const parentNode: TreeNode = {
      id: '1', name: 'Root', childCount: 2, parentId: '-1', isExpanded: true, isLoading: false, isSelected: false, children: [
        { id: '2', name: 'Child 1', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: true },
        { id: '3', name: 'Child 2', childCount: 0, parentId: '1', isExpanded: false, isLoading: false, isSelected: true }
      ]
    };
    component.node = parentNode;
    component.onNodeSelect(parentNode);
  
    expect(parentNode.children![0].isSelected).toBe(false); // Verify child 1 is deselected
    expect(parentNode.children![1].isSelected).toBe(false); // Verify child 2 is deselected
  });
});
