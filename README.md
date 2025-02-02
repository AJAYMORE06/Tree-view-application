**Tree Structure with Lazy Loading and Search Functionality**
This Angular tree structure component implements lazy loading for secondary levels, alongside advanced search and filtering capabilities. The tree is optimized with cache control, a nested structure, and a clean, user-friendly UI design.

•	The tree is 3 levels deep. The first level loads initially, while subsequent levels (2nd level onwards) load lazily when the parent node is expanded.
•	Each node includes:
a)	A unique identifier
b)	Display name
c)	An icon/indicator showing whether the node is expandable
d)	A loading indicator while fetching child nodes.
e)	The tree structure maintains proper indentation for different levels, smooth animations for expanding and collapsing nodes, and clear visual indicators for:
i.	Expandable nodes
ii.	Currently expanded nodes
iii.	Lazy Loading Implementation

•	A mock API simulates network calls, introducing a delay (500-1000ms) to mimic real-world scenarios.
•	The API returns data in the following format:
interface TreeNode {
id: string;
name: string;
childCount: number;
parentId: string; //-1 for root node
children?: TreeNode[];
isExpanded?: boolean;
isLoading?: boolean;
}

•	A search input allows users to filter the tree based on node names, offering:
a)	Filtering across all loaded levels
b)	Highlighting matching text
c)	Displaying parent nodes of matching children
d)	Real-time results with debounce functionality
e)	A "No results found" message when applicable

•	Additional Features:
a.	Separate, reusable tree component for maintainability.
b.	Usage of TypeScript interfaces/types for strong typing.
c.	Utilization of RxJS for handling observables efficiently.
d.	Persistent expanded node state management.
e.	Cache-controlled nodes to prevent unnecessary API calls.
f.	Optimized search performance using debounceTime.
g.	Error handling with a retry mechanism for failed requests.
h.	Keyboard navigation support.
i.	Fully responsive design.
j.	Node selection (single/multi).
k.	Comprehensive unit test cases for both root and child nodes, covering positive and negative scenarios.

![tree-view](https://github.com/user-attachments/assets/e430eee0-1761-4195-8bb7-687d803f8e09)
