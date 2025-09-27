import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Toolbar } from "./Toolbar";
import type { TreeNodeType } from "../../types/TreeNode";

jest.mock("../ui/Buton", () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button
      onClick={onClick}
      data-testid={`button-${variant}`}
      className={`btn-${variant}`}
    >
      {children}
    </button>
  ),
}));

jest.mock("../ui/ToggleSwitch", () => ({
  ToggleSwitch: ({ onChange, checked, label }: any) => (
    <div data-testid="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        data-testid="toggle-input"
      />
      {label && <span>{label}</span>}
    </div>
  ),
}));

describe("Toolbar Component", () => {
  const mockNode: TreeNodeType = {
    id: "test-node-1",
    value: "Test Value",
    label: "Test Label",
    children: [],
    readOnly: false,
  };

  const mockProps = {
    node: mockNode,
    onAdd: jest.fn(),
    onDelete: jest.fn(),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all toolbar elements", () => {
      render(<Toolbar {...mockProps} />);

      expect(screen.getByTestId("toggle-switch")).toBeInTheDocument();
      expect(screen.getByTestId("button-ghost")).toBeInTheDocument();
      expect(screen.getByTestId("button-dashed")).toBeInTheDocument();
      expect(screen.getByText("🗑")).toBeInTheDocument();
      expect(screen.getByText("+")).toBeInTheDocument();
    });

    it("should render with correct CSS classes", () => {
      const { container } = render(<Toolbar {...mockProps} />);

      const toolbarContainer = container.firstChild as HTMLElement;
      expect(toolbarContainer).toHaveClass(
        "flex",
        "items-center",
        "gap-1",
        "ml-auto"
      );

      const innerContainer = toolbarContainer.querySelector(".bg-gray-100");
      expect(innerContainer).toHaveClass(
        "flex",
        "items-center",
        "gap-1",
        "bg-gray-100",
        "py-.5",
        "px-2",
        "shadow-md"
      );
    });

    it('should render toggle switch with "Read only" label', () => {
      render(<Toolbar {...mockProps} />);

      expect(screen.getByText("Read only")).toBeInTheDocument();
    });
  });

  describe("ToggleSwitch Interactions", () => {
    it("should pass correct checked state to toggle switch when readOnly is false", () => {
      render(<Toolbar {...mockProps} />);

      const toggleInput = screen.getByTestId("toggle-input");
      expect(toggleInput).not.toBeChecked();
    });

    it("should pass correct checked state to toggle switch when readOnly is true", () => {
      const nodeWithReadOnly = { ...mockNode, readOnly: true };
      render(<Toolbar {...mockProps} node={nodeWithReadOnly} />);

      const toggleInput = screen.getByTestId("toggle-input");
      expect(toggleInput).toBeChecked();
    });

    it("should handle readOnly undefined correctly", () => {
      const nodeWithoutReadOnly = { ...mockNode };
      delete nodeWithoutReadOnly.readOnly;

      render(<Toolbar {...mockProps} node={nodeWithoutReadOnly} />);

      const toggleInput = screen.getByTestId("toggle-input");
      expect(toggleInput).not.toBeChecked();
    });

    it("should call onUpdate when toggle switch changes to true", () => {
      render(<Toolbar {...mockProps} />);

      const toggleInput = screen.getByTestId("toggle-input");
      fireEvent.click(toggleInput);

      expect(mockProps.onUpdate).toHaveBeenCalledWith(mockNode.id, {
        ...mockNode,
        readOnly: true,
      });
    });

    it("should call onUpdate when toggle switch changes to false", () => {
      const nodeWithReadOnly = { ...mockNode, readOnly: true };
      render(<Toolbar {...mockProps} node={nodeWithReadOnly} />);

      const toggleInput = screen.getByTestId("toggle-input");
      fireEvent.click(toggleInput);

      expect(mockProps.onUpdate).toHaveBeenCalledWith(mockNode.id, {
        ...nodeWithReadOnly,
        readOnly: false,
      });
    });
  });

  describe("Button Interactions", () => {
    it("should call onDelete when delete button is clicked", () => {
      render(<Toolbar {...mockProps} />);

      const deleteButton = screen.getByTestId("button-ghost");
      fireEvent.click(deleteButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith(mockNode.id);
      expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it("should call onAdd when add button is clicked", () => {
      render(<Toolbar {...mockProps} />);

      const addButton = screen.getByTestId("button-dashed");
      fireEvent.click(addButton);

      expect(mockProps.onAdd).toHaveBeenCalledWith(mockNode.id);
      expect(mockProps.onAdd).toHaveBeenCalledTimes(1);
    });

    it("should render delete button with ghost variant", () => {
      render(<Toolbar {...mockProps} />);

      const deleteButton = screen.getByTestId("button-ghost");
      expect(deleteButton).toHaveClass("btn-ghost");
    });

    it("should render add button with dashed variant", () => {
      render(<Toolbar {...mockProps} />);

      const addButton = screen.getByTestId("button-dashed");
      expect(addButton).toHaveClass("btn-dashed");
    });
  });

  describe("Callback Functions", () => {
    it("should not call callbacks when component mounts", () => {
      render(<Toolbar {...mockProps} />);

      expect(mockProps.onAdd).not.toHaveBeenCalled();
      expect(mockProps.onDelete).not.toHaveBeenCalled();
      expect(mockProps.onUpdate).not.toHaveBeenCalled();
    });

    it("should handle multiple rapid clicks correctly", () => {
      render(<Toolbar {...mockProps} />);

      const addButton = screen.getByTestId("button-dashed");

      // Click multiple times rapidly
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(mockProps.onAdd).toHaveBeenCalledTimes(3);
      expect(mockProps.onAdd).toHaveBeenCalledWith(mockNode.id);
    });

    it("should preserve node data when updating readOnly state", () => {
      const complexNode: TreeNodeType = {
        id: "complex-node",
        value: "Complex Value",
        label: "Complex Label",
        children: [
          { id: "child-1", value: "Child 1", label: "Child 1", children: [] },
        ],
        readOnly: false,
        isLast: true,
      };

      render(<Toolbar {...mockProps} node={complexNode} />);

      const toggleInput = screen.getByTestId("toggle-input");
      fireEvent.click(toggleInput);

      expect(mockProps.onUpdate).toHaveBeenCalledWith(complexNode.id, {
        ...complexNode,
        readOnly: true,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty node id", () => {
      const nodeWithEmptyId = { ...mockNode, id: "" };
      render(<Toolbar {...mockProps} node={nodeWithEmptyId} />);

      const deleteButton = screen.getByTestId("button-ghost");
      fireEvent.click(deleteButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith("");
    });

    it("should handle node with special characters in id", () => {
      const nodeWithSpecialId = { ...mockNode, id: "test-node_123!@#" };
      render(<Toolbar {...mockProps} node={nodeWithSpecialId} />);

      const addButton = screen.getByTestId("button-dashed");
      fireEvent.click(addButton);

      expect(mockProps.onAdd).toHaveBeenCalledWith("test-node_123!@#");
    });

    it("should handle missing callback functions gracefully", () => {
      const propsWithoutCallbacks = {
        node: mockNode,
        onAdd: undefined as any,
        onDelete: undefined as any,
        onUpdate: undefined as any,
      };

      // This should not throw an error
      expect(() => {
        render(<Toolbar {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles", () => {
      render(<Toolbar {...mockProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2); // Delete and Add buttons
    });

    it("should have proper checkbox role for toggle", () => {
      render(<Toolbar {...mockProps} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });
  });
});
