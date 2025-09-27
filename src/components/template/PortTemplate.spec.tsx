import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PortTemplate } from "./PortTemplate";
import type { TreeNodeType } from "../../types/TreeNode";

// Mock the usePortTemplate hook
const mockUsePortTemplate = {
  addNode: jest.fn(),
  deleteNode: jest.fn(),
  updateNode: jest.fn(),
  handleSave: jest.fn(),
  clearStorage: jest.fn(),
  activeNodeId: null as string | null,
  setActiveNodeId: jest.fn(),
  tree: [] as TreeNodeType[],
  setTree: jest.fn(),
};

jest.mock("../../hooks/usePortTemplate", () => ({
  usePortTemplate: jest.fn(() => mockUsePortTemplate),
}));

// Tracking mocks (do NOT reference these directly in the factory return value)
const mockPortTemplateHeader = jest.fn();
const mockTreeNode = jest.fn();

// Component mocks implemented inside factory to avoid early variable access
jest.mock("./PortTemplateHeader", () => ({
  PortTemplateHeader: (props: any) => {
    const { tree, setTree, setActiveNodeId, handleSave, clearStorage } = props;
    mockPortTemplateHeader(props);
    return (
      <div data-testid="port-template-header">
        <span data-testid="tree-count">{tree.length}</span>
        <button
          onClick={() =>
            setTree([
              ...tree,
              { id: "new-1", label: "root", value: "", children: [] },
            ])
          }
          data-testid="add-root"
        >
          Add Root
        </button>
        <button onClick={handleSave} data-testid="save">
          Save
        </button>
        <button onClick={clearStorage} data-testid="clear">
          Clear
        </button>
        <button
          onClick={() => setActiveNodeId("test-active")}
          data-testid="set-active"
        >
          Set Active
        </button>
      </div>
    );
  },
}));

jest.mock("./TreeNode", () => ({
  TreeNode: (props: any) => {
    const {
      node,
      onAdd,
      onDelete,
      onUpdate,
      activeNodeId,
      setActiveNodeId,
      treeLength,
      isLast,
    } = props;
    mockTreeNode(props);
    return (
      <div data-testid={`tree-node-${node.id}`}>
        <span data-testid={`node-label-${node.id}`}>{node.label}</span>
        <span data-testid={`node-value-${node.id}`}>{node.value}</span>
        <span data-testid={`tree-length-${node.id}`}>{treeLength}</span>
        <span data-testid={`is-last-${node.id}`}>{isLast.toString()}</span>
        <span data-testid={`is-active-${node.id}`}>
          {(activeNodeId === node.id).toString()}
        </span>
        <button onClick={() => onAdd(node.id)} data-testid={`add-${node.id}`}>
          Add Child
        </button>
        <button
          onClick={() => onDelete(node.id)}
          data-testid={`delete-${node.id}`}
        >
          Delete
        </button>
        <button
          onClick={() => {
            setActiveNodeId(node.id);
            onUpdate(node.id, { ...node, value: "updated value" });
          }}
          data-testid={`update-${node.id}`}
        >
          Update
        </button>
      </div>
    );
  },
}));

describe("PortTemplate Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state
    mockUsePortTemplate.tree = [];
    mockUsePortTemplate.activeNodeId = null;
  });

  describe("Initial Rendering", () => {
    it("should render the PortTemplate component with proper structure", () => {
      render(<PortTemplate />);

      // Check main container
      const container = document.querySelector(
        ".p-6.max-w-\\[700px\\].mx-auto"
      );
      expect(container).toBeInTheDocument();

      // Check header is rendered
      expect(screen.getByTestId("port-template-header")).toBeInTheDocument();
    });

    it("should render with empty tree initially", () => {
      render(<PortTemplate />);

      // Should not find any tree nodes initially
      expect(screen.queryByTestId(/tree-node-/)).not.toBeInTheDocument();
      expect(screen.getByTestId("tree-count")).toHaveTextContent("0");
    });

    it("should pass correct props to PortTemplateHeader", () => {
      render(<PortTemplate />);
      // The mock is invoked with a single props object; previous test incorrectly expected two args
      expect(mockPortTemplateHeader).toHaveBeenCalledTimes(1);
      const firstCallArgs = (mockPortTemplateHeader as jest.Mock).mock
        .calls[0][0];
      expect(firstCallArgs).toEqual(
        expect.objectContaining({
          tree: mockUsePortTemplate.tree,
          setTree: mockUsePortTemplate.setTree,
          setActiveNodeId: mockUsePortTemplate.setActiveNodeId,
          handleSave: mockUsePortTemplate.handleSave,
          clearStorage: mockUsePortTemplate.clearStorage,
        })
      );
    });
  });

  describe("Tree Rendering", () => {
    it("should render tree nodes when tree has data", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "Value 1", children: [] },
        { id: "node-2", label: "Node 2", value: "Value 2", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      expect(screen.getByTestId("tree-node-node-1")).toBeInTheDocument();
      expect(screen.getByTestId("tree-node-node-2")).toBeInTheDocument();
      expect(screen.getByTestId("node-label-node-1")).toHaveTextContent(
        "Node 1"
      );
      expect(screen.getByTestId("node-value-node-1")).toHaveTextContent(
        "Value 1"
      );
      expect(screen.getByTestId("node-label-node-2")).toHaveTextContent(
        "Node 2"
      );
      expect(screen.getByTestId("node-value-node-2")).toHaveTextContent(
        "Value 2"
      );
    });

    it("should pass correct props to each TreeNode", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "Value 1", children: [] },
        { id: "node-2", label: "Node 2", value: "Value 2", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;
      mockUsePortTemplate.activeNodeId = "node-1";

      render(<PortTemplate />);
      expect(mockTreeNode).toHaveBeenCalledTimes(2);

      expect(mockTreeNode).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          node: testTree[0],
          onAdd: mockUsePortTemplate.addNode,
          onDelete: mockUsePortTemplate.deleteNode,
          onUpdate: mockUsePortTemplate.updateNode,
          activeNodeId: "node-1",
          setActiveNodeId: mockUsePortTemplate.setActiveNodeId,
          treeLength: 2,
          isLast: false,
        })
      );

      expect(mockTreeNode).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          node: testTree[1],
          onAdd: mockUsePortTemplate.addNode,
          onDelete: mockUsePortTemplate.deleteNode,
          onUpdate: mockUsePortTemplate.updateNode,
          activeNodeId: "node-1",
          setActiveNodeId: mockUsePortTemplate.setActiveNodeId,
          treeLength: 2,
          isLast: true,
        })
      );
    });

    it("should correctly calculate isLast prop for tree nodes", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "First", value: "", children: [] },
        { id: "node-2", label: "Middle", value: "", children: [] },
        { id: "node-3", label: "Last", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      expect(screen.getByTestId("is-last-node-1")).toHaveTextContent("false");
      expect(screen.getByTestId("is-last-node-2")).toHaveTextContent("false");
      expect(screen.getByTestId("is-last-node-3")).toHaveTextContent("true");
    });

    it("should pass correct treeLength to all nodes", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
        { id: "node-2", label: "Node 2", value: "", children: [] },
        { id: "node-3", label: "Node 3", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      expect(screen.getByTestId("tree-length-node-1")).toHaveTextContent("3");
      expect(screen.getByTestId("tree-length-node-2")).toHaveTextContent("3");
      expect(screen.getByTestId("tree-length-node-3")).toHaveTextContent("3");
    });
  });

  describe("Active Node Management", () => {
    it("should pass active node ID to tree nodes", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
        { id: "node-2", label: "Node 2", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;
      mockUsePortTemplate.activeNodeId = "node-2";

      render(<PortTemplate />);

      expect(screen.getByTestId("is-active-node-1")).toHaveTextContent("false");
      expect(screen.getByTestId("is-active-node-2")).toHaveTextContent("true");
    });

    it("should handle null active node ID", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;
      mockUsePortTemplate.activeNodeId = null;

      render(<PortTemplate />);

      expect(screen.getByTestId("is-active-node-1")).toHaveTextContent("false");
    });

    it("should allow setting active node through TreeNode interactions", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      const updateButton = screen.getByTestId("update-node-1");
      fireEvent.click(updateButton);

      expect(mockUsePortTemplate.setActiveNodeId).toHaveBeenCalledWith(
        "node-1"
      );
    });
  });

  describe("Hook Integration", () => {
    it("should call hook functions through TreeNode interactions", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "Original", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      // Test addNode
      const addButton = screen.getByTestId("add-node-1");
      fireEvent.click(addButton);
      expect(mockUsePortTemplate.addNode).toHaveBeenCalledWith("node-1");

      // Test deleteNode
      const deleteButton = screen.getByTestId("delete-node-1");
      fireEvent.click(deleteButton);
      expect(mockUsePortTemplate.deleteNode).toHaveBeenCalledWith("node-1");

      // Test updateNode
      const updateButton = screen.getByTestId("update-node-1");
      fireEvent.click(updateButton);
      expect(mockUsePortTemplate.updateNode).toHaveBeenCalledWith("node-1", {
        id: "node-1",
        label: "Node 1",
        value: "updated value",
        children: [],
      });
    });

    it("should call hook functions through PortTemplateHeader interactions", () => {
      render(<PortTemplate />);

      // Test save
      const saveButton = screen.getByTestId("save");
      fireEvent.click(saveButton);
      expect(mockUsePortTemplate.handleSave).toHaveBeenCalled();

      // Test clear
      const clearButton = screen.getByTestId("clear");
      fireEvent.click(clearButton);
      expect(mockUsePortTemplate.clearStorage).toHaveBeenCalled();

      // Test setActiveNodeId
      const setActiveButton = screen.getByTestId("set-active");
      fireEvent.click(setActiveButton);
      expect(mockUsePortTemplate.setActiveNodeId).toHaveBeenCalledWith(
        "test-active"
      );
    });

    it("should call setTree through PortTemplateHeader", () => {
      render(<PortTemplate />);

      const addRootButton = screen.getByTestId("add-root");
      fireEvent.click(addRootButton);

      expect(mockUsePortTemplate.setTree).toHaveBeenCalledWith([
        { id: "new-1", label: "root", value: "", children: [] },
      ]);
    });
  });

  describe("Component Structure", () => {
    it("should have correct CSS classes on main container", () => {
      const { container } = render(<PortTemplate />);

      const mainDiv = container.querySelector(".p-6.max-w-\\[700px\\].mx-auto");
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass("p-6", "max-w-[700px]", "mx-auto");
    });

    it("should render nodes inside a div container", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      const { container } = render(<PortTemplate />);
      // After render, structure is:
      // <mainDiv>
      //   <PortTemplateHeader />
      //   <div class="...wrapper...">
      //      <div data-testid="tree-node-node-1" />
      //   </div>
      // </mainDiv>
      const mainDiv = container.querySelector(".p-6.max-w-\\[700px\\].mx-auto");
      expect(mainDiv).toBeInTheDocument();
      const children = Array.from(mainDiv!.children);
      // header is first child, wrapper is second
      const nodesWrapper = children[1];
      expect(nodesWrapper).toBeTruthy();
      const nodeElements = nodesWrapper.querySelectorAll(
        '[data-testid^="tree-node-"]'
      );
      expect(nodeElements).toHaveLength(1);
    });

    it("should render header before tree nodes", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      const { container } = render(<PortTemplate />);

      const mainDiv = container.querySelector(".p-6.max-w-\\[700px\\].mx-auto");
      const children = Array.from(mainDiv?.children || []);

      expect(children[0]).toHaveAttribute(
        "data-testid",
        "port-template-header"
      );
      expect(children[1]?.children[0]).toHaveAttribute(
        "data-testid",
        "tree-node-node-1"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle single node tree", () => {
      const testTree: TreeNodeType[] = [
        { id: "single-node", label: "Single", value: "Value", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      expect(screen.getByTestId("tree-node-single-node")).toBeInTheDocument();
      expect(screen.getByTestId("is-last-single-node")).toHaveTextContent(
        "true"
      );
      expect(screen.getByTestId("tree-length-single-node")).toHaveTextContent(
        "1"
      );
    });

    it("should handle empty tree gracefully", () => {
      mockUsePortTemplate.tree = [];

      render(<PortTemplate />);

      expect(screen.queryByTestId(/tree-node-/)).not.toBeInTheDocument();
      expect(screen.getByTestId("port-template-header")).toBeInTheDocument();
    });

    it("should handle tree with nodes that have empty values", () => {
      const testTree: TreeNodeType[] = [
        { id: "empty-node", label: "", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      expect(screen.getByTestId("tree-node-empty-node")).toBeInTheDocument();
      expect(screen.getByTestId("node-label-empty-node")).toHaveTextContent("");
      expect(screen.getByTestId("node-value-empty-node")).toHaveTextContent("");
    });

    it("should handle nodes with special characters in IDs", () => {
      const testTree: TreeNodeType[] = [
        {
          id: "node-with-special-chars_123",
          label: "Special",
          value: "Value",
          children: [],
        },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      expect(
        screen.getByTestId("tree-node-node-with-special-chars_123")
      ).toBeInTheDocument();
    });

    it("should re-render when tree changes", () => {
      const { rerender } = render(<PortTemplate />);

      // Initially empty
      expect(screen.queryByTestId(/tree-node-/)).not.toBeInTheDocument();

      // Update tree
      mockUsePortTemplate.tree = [
        { id: "new-node", label: "New", value: "New Value", children: [] },
      ];

      rerender(<PortTemplate />);

      expect(screen.getByTestId("tree-node-new-node")).toBeInTheDocument();
    });

    it("should re-render when activeNodeId changes", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;
      mockUsePortTemplate.activeNodeId = null;

      const { rerender } = render(<PortTemplate />);

      expect(screen.getByTestId("is-active-node-1")).toHaveTextContent("false");

      // Change active node
      mockUsePortTemplate.activeNodeId = "node-1";

      rerender(<PortTemplate />);

      expect(screen.getByTestId("is-active-node-1")).toHaveTextContent("true");
    });
  });

  describe("Performance", () => {
    it("should use node.id as key for TreeNode components", () => {
      const testTree: TreeNodeType[] = [
        { id: "node-1", label: "Node 1", value: "", children: [] },
        { id: "node-2", label: "Node 2", value: "", children: [] },
      ];

      mockUsePortTemplate.tree = testTree;

      render(<PortTemplate />);

      // Verify that each TreeNode was rendered with correct key (indirectly through calls)
      expect(mockTreeNode).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("tree-node-node-1")).toBeInTheDocument();
      expect(screen.getByTestId("tree-node-node-2")).toBeInTheDocument();
    });
  });
});
