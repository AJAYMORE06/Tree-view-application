import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTreeNodeComponent } from './app-tree-node.component';

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
});
