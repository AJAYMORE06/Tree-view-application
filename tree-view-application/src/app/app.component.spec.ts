import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TreeNode } from './tree.model';
import { TreeService } from './tree.service';
import { throwError } from 'rxjs';

describe('AppComponent', () => {
  let service: TreeService;
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [TreeService]
    });

    fixture = TestBed.createComponent(AppComponent);
    service = TestBed.inject(TreeService);
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should return root nodes correctly', (done) => {
    // Arrange: Set up the mock data
    const expectedRootNodes: TreeNode[] = [
      { id: '1', name: 'Root 1', childCount: 3, parentId: '-1', isExpanded: false, isLoading: false, isSelected: false },
      { id: '2', name: 'Root 2', childCount: 2, parentId: '-1', isExpanded: false, isLoading: false, isSelected: false }
    ];

    // Act: Call the service method
    service.getRootNodes().subscribe((result) => {
      // Assert: Check the returned root nodes
      expect(result).toEqual(expectedRootNodes);
      done();
    });
  });

  it('should handle error when fetching root nodes fails', (done) => {
    // Simulate an error in the service
    spyOn(service, 'getRootNodes').and.returnValue(throwError(() => new Error('Failed to fetch root nodes')));

    // Act: Call the service method
    service.getRootNodes().subscribe({
      next: () => { },
      error: (error) => {
        // Assert: Check if the error is handled
        expect(error).toEqual(new Error('Failed to fetch root nodes'));
        done();
      }
    });
  });
});
