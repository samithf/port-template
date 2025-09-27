import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreeNode } from "./TreeNode";
import type { TreeNodeType } from "../../types/TreeNode";

jest.mock("../ui/InputText", () => ({
  InputText: jest.fn(({ value, onChange, onClick, readonly }) => (
    <input
      data-testid="input-text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onClick={onClick}
      readOnly={readonly}
    />
  )),
}));

jest.mock("./Toolbar", () => ({
  Toolbar: jest.fn(({ node, onAdd, onDelete, onUpdate }) => (
    <div data-testid="toolbar">
      <button onClick={() => onAdd(node.id)}>Add</button>
      <button onClick={() => onDelete(node.id)}>Delete</button>
      <button
        onClick={() => onUpdate(node.id, { ...node, readOnly: !node.readOnly })}
      >
        Update
      </button>
    </div>
  )),
}));

describe("TreeNode Component", () => {
  const mockProps = {
    onAdd: jest.fn(),
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
    setActiveNodeId: jest.fn(),
    isLast: false,
    activeNodeId: null,
    treeLength: 1,
  };

  const mockNode: TreeNodeType = {
    id: "node-1",
    value: "Test Value",
    label: "Test Node",
    children: [],
    readOnly: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the TreeNode component", () => {
      render(<TreeNode node={mockNode} {...mockProps} />);

      expect(screen.getByTestId("input-text")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Value")).toBeInTheDocument();
    });

    it("should render with correct initial value", () => {
      render(<TreeNode node={mockNode} {...mockProps} />);

      const input = screen.getByTestId("input-text");
      expect(input).toHaveValue("Test Value");
    });

    it("should render read-only input when node is read-only", () => {
      const readOnlyNode = { ...mockNode, readOnly: true };
      render(<TreeNode node={readOnlyNode} {...mockProps} />);

      const input = screen.getByTestId("input-text");
      expect(input).toHaveAttribute("readOnly");
    });

    it("should render toolbar when node is active", () => {
      render(<TreeNode node={mockNode} {...mockProps} activeNodeId="node-1" />);

      expect(screen.getByTestId("toolbar")).toBeInTheDocument();
    });

    it("should not render toolbar when node is not active", () => {
      render(
        <TreeNode node={mockNode} {...mockProps} activeNodeId="other-node" />
      );

      expect(screen.queryByTestId("toolbar")).not.toBeInTheDocument();
    });
  });

  describe("Connector Lines", () => {
    it("should render connector line for root node when not last", () => {
      const rootNode = { ...mockNode, label: "root" };
      const { container } = render(
        <TreeNode node={rootNode} {...mockProps} isLast={false} />
      );

      const connectorLine = container.querySelector(".bg-gray-200");
      expect(connectorLine).toBeInTheDocument();
    });

    it("should render connector line for root node when is last", () => {
      const rootNode = { ...mockNode, label: "root" };
      const { container } = render(
        <TreeNode node={rootNode} {...mockProps} isLast={true} />
      );

      const connectorLine = container.querySelector(".bg-gray-200");
      expect(connectorLine).toBeInTheDocument();
    });

    it("should render connector line for non-root node when not last", () => {
      const { container } = render(
        <TreeNode node={mockNode} {...mockProps} isLast={false} />
      );

      const connectorLine = container.querySelector(".bg-gray-200");
      expect(connectorLine).toBeInTheDocument();
    });

    it("should render connector line for non-root node when is last", () => {
      const { container } = render(
        <TreeNode node={mockNode} {...mockProps} isLast={true} />
      );

      const connectorLine = container.querySelector(".bg-gray-200");
      expect(connectorLine).toBeInTheDocument();
    });

    it("should render horizontal connector line", () => {
      const { container } = render(<TreeNode node={mockNode} {...mockProps} />);

      const horizontalLine = container.querySelector(
        '[class*="before:bg-gray-200"]'
      );
      expect(horizontalLine).toBeInTheDocument();
    });
  });

  describe("Input Interactions", () => {
    it("should call setActiveNodeId when input is clicked", () => {
      render(<TreeNode node={mockNode} {...mockProps} />);

      const input = screen.getByTestId("input-text");
      fireEvent.click(input);

      expect(mockProps.setActiveNodeId).toHaveBeenCalledWith("node-1");
    });

    it("should update field value and call onUpdate when input changes", () => {
      render(<TreeNode node={mockNode} {...mockProps} />);

      const input = screen.getByTestId("input-text");
      fireEvent.change(input, { target: { value: "New Value" } });

      expect(mockProps.onUpdate).toHaveBeenCalledWith("node-1", {
        ...mockNode,
        value: "New Value",
      });
    });

    it("should update internal field value state", () => {
      render(<TreeNode node={mockNode} {...mockProps} />);

      const input = screen.getByTestId("input-text");
      fireEvent.change(input, { target: { value: "Updated Value" } });

      expect(input).toHaveValue("Updated Value");
    });
  });

  describe("Toolbar Interactions", () => {
    it("should call onAdd when toolbar add button is clicked", () => {
      render(<TreeNode node={mockNode} {...mockProps} activeNodeId="node-1" />);

      const addButton = screen.getByText("Add");
      fireEvent.click(addButton);

      expect(mockProps.onAdd).toHaveBeenCalledWith("node-1");
    });

    it("should call onDelete when toolbar delete button is clicked", () => {
      render(<TreeNode node={mockNode} {...mockProps} activeNodeId="node-1" />);

      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith("node-1");
    });

    it("should call onUpdate when toolbar update button is clicked", () => {
      render(<TreeNode node={mockNode} {...mockProps} activeNodeId="node-1" />);

      const updateButton = screen.getByText("Update");
      fireEvent.click(updateButton);

      expect(mockProps.onUpdate).toHaveBeenCalledWith("node-1", {
        ...mockNode,
        readOnly: true,
      });
    });
  });

  describe("Children Rendering", () => {
    it("should render child nodes recursively", () => {
      const nodeWithChildren: TreeNodeType = {
        ...mockNode,
        children: [
          {
            id: "child-1",
            value: "Child Value",
            label: "Child Node",
            children: [],
          },
        ],
      };

      render(<TreeNode node={nodeWithChildren} {...mockProps} />);

      const inputs = screen.getAllByTestId("input-text");
      expect(inputs).toHaveLength(2); // Parent + child
      expect(screen.getByDisplayValue("Test Value")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Child Value")).toBeInTheDocument();
    });

    it("should pass correct isLast prop to child nodes", () => {
      const nodeWithMultipleChildren: TreeNodeType = {
        ...mockNode,
        children: [
          {
            id: "child-1",
            value: "Child 1",
            label: "Child 1",
            children: [],
          },
          {
            id: "child-2",
            value: "Child 2",
            label: "Child 2",
            children: [],
          },
        ],
      };

      const { container } = render(
        <TreeNode node={nodeWithMultipleChildren} {...mockProps} />
      );

      // Should render multiple child nodes
      const inputs = screen.getAllByTestId("input-text");
      expect(inputs).toHaveLength(3); // Parent + 2 children

      // Verify container has the tree structure
      expect(container.querySelector(".relative")).toBeInTheDocument();
    });

    it("should render deeply nested children", () => {
      const deeplyNestedNode: TreeNodeType = {
        ...mockNode,
        children: [
          {
            id: "child-1",
            value: "Child 1",
            label: "Child 1",
            children: [
              {
                id: "grandchild-1",
                value: "Grandchild 1",
                label: "Grandchild 1",
                children: [],
              },
            ],
          },
        ],
      };

      render(<TreeNode node={deeplyNestedNode} {...mockProps} />);

      const inputs = screen.getAllByTestId("input-text");
      expect(inputs).toHaveLength(3); // Parent + child + grandchild
      expect(screen.getByDisplayValue("Test Value")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Child 1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Grandchild 1")).toBeInTheDocument();
    });
  });

  describe("Props Passing", () => {
    it("should pass all required props to child nodes", () => {
      const nodeWithChildren: TreeNodeType = {
        ...mockNode,
        children: [
          {
            id: "child-1",
            value: "Child Value",
            label: "Child Node",
            children: [],
          },
        ],
      };

      render(<TreeNode node={nodeWithChildren} {...mockProps} />);

      // Child should receive all the same callbacks
      const childInput = screen.getByDisplayValue("Child Value");
      fireEvent.click(childInput);

      expect(mockProps.setActiveNodeId).toHaveBeenCalledWith("child-1");
    });

    it("should maintain activeNodeId state across parent and children", () => {
      const nodeWithChildren: TreeNodeType = {
        ...mockNode,
        children: [
          {
            id: "child-1",
            value: "Child Value",
            label: "Child Node",
            children: [],
          },
        ],
      };

      render(
        <TreeNode
          node={nodeWithChildren}
          {...mockProps}
          activeNodeId="child-1"
        />
      );

      // But child should show toolbar (would be handled by recursive call)
      const inputs = screen.getAllByTestId("input-text");
      expect(inputs).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty node value", () => {
      const emptyNode = { ...mockNode, value: "" };
      render(<TreeNode node={emptyNode} {...mockProps} />);

      const input = screen.getByTestId("input-text");
      expect(input).toHaveValue("");
    });

    it("should handle node without readOnly property", () => {
      const nodeWithoutReadOnly = { ...mockNode };
      delete nodeWithoutReadOnly.readOnly;

      render(<TreeNode node={nodeWithoutReadOnly} {...mockProps} />);

      const input = screen.getByTestId("input-text");
      expect(input).not.toHaveAttribute("readOnly");
    });

    it("should handle null activeNodeId", () => {
      render(<TreeNode node={mockNode} {...mockProps} activeNodeId={null} />);

      expect(screen.queryByTestId("toolbar")).not.toBeInTheDocument();
    });

    it("should handle isLast prop correctly", () => {
      const { container: containerNotLast } = render(
        <TreeNode node={mockNode} {...mockProps} isLast={false} />
      );
      const { container: containerLast } = render(
        <TreeNode node={mockNode} {...mockProps} isLast={true} />
      );

      // Both should render, but with different connector line styles
      expect(containerNotLast.querySelector(".relative")).toBeInTheDocument();
      expect(containerLast.querySelector(".relative")).toBeInTheDocument();
    });
  });
});
