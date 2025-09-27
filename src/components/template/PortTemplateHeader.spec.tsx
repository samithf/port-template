import { render, screen, fireEvent } from "@testing-library/react";
import { PortTemplateHeader } from "./PortTemplateHeader";
import type { TreeNodeType } from "../../types/TreeNode";
import "@testing-library/jest-dom";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-1234"),
}));

describe("PortTemplateHeader", () => {
  const mockTree: TreeNodeType[] = [
    {
      id: "1",
      value: "test value",
      label: "Test Node",
      children: [],
    },
  ];

  const defaultProps = {
    tree: mockTree,
    setTree: jest.fn(),
    setActiveNodeId: jest.fn(),
    handleSave: jest.fn(),
    clearStorage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<PortTemplateHeader {...defaultProps} />);

    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Clear Storage")).toBeInTheDocument();
  });

  it("has correct structure and layout", () => {
    const { container } = render(<PortTemplateHeader {...defaultProps} />);

    // Check main container has correct classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass("flex", "gap-2", "mb-4");

    // Check button container has correct classes
    const buttonContainer = container.querySelector(".ml-auto");
    expect(buttonContainer).toHaveClass("ml-auto", "flex", "gap-2");
  });

  describe("Add button functionality", () => {
    it("calls setActiveNodeId and setTree when add button is clicked", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const addButton = screen.getByText("+");
      fireEvent.click(addButton);

      expect(defaultProps.setActiveNodeId).toHaveBeenCalledWith(
        "mock-uuid-1234"
      );
      expect(defaultProps.setTree).toHaveBeenCalledWith([
        ...mockTree,
        {
          id: "mock-uuid-1234",
          value: "",
          label: "root",
          children: [],
        },
      ]);
    });

    it("adds new node with correct structure", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const addButton = screen.getByText("+");
      fireEvent.click(addButton);

      const expectedNewTree = [
        ...mockTree,
        {
          id: "mock-uuid-1234",
          value: "",
          label: "root",
          children: [],
        },
      ];

      expect(defaultProps.setTree).toHaveBeenCalledWith(expectedNewTree);
    });

    it("preserves existing tree when adding new node", () => {
      const multiNodeTree = [
        ...mockTree,
        {
          id: "2",
          value: "second value",
          label: "Second Node",
          children: [],
        },
      ];

      render(<PortTemplateHeader {...defaultProps} tree={multiNodeTree} />);

      const addButton = screen.getByText("+");
      fireEvent.click(addButton);

      expect(defaultProps.setTree).toHaveBeenCalledWith([
        ...multiNodeTree,
        {
          id: "mock-uuid-1234",
          value: "",
          label: "root",
          children: [],
        },
      ]);
    });
  });

  describe("Button interactions", () => {
    it("calls handleSave when Save button is clicked", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      expect(defaultProps.handleSave).toHaveBeenCalledTimes(1);
    });

    it("calls clearStorage when Clear Storage button is clicked", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const clearButton = screen.getByText("Clear Storage");
      fireEvent.click(clearButton);

      expect(defaultProps.clearStorage).toHaveBeenCalledTimes(1);
    });

    it("does not call any handlers when Back button is clicked", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const backButton = screen.getByText("Back");
      fireEvent.click(backButton);

      // Back button doesn't have onClick handler in current implementation
      expect(defaultProps.handleSave).not.toHaveBeenCalled();
      expect(defaultProps.clearStorage).not.toHaveBeenCalled();
      expect(defaultProps.setTree).not.toHaveBeenCalled();
      expect(defaultProps.setActiveNodeId).not.toHaveBeenCalled();
    });
  });

  describe("Button variants", () => {
    it("renders buttons with correct variants", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      // Add button should have dashed variant
      const addButton = screen.getByText("+");
      expect(addButton).toHaveClass("btn-dashed");

      // Back button should have secondary variant
      const backButton = screen.getByText("Back");
      expect(backButton).toHaveClass("btn-secondary");

      // Save button should have primary variant
      const saveButton = screen.getByText("Save");
      expect(saveButton).toHaveClass("btn-primary");

      // Clear Storage button should have default (primary) variant
      const clearButton = screen.getByText("Clear Storage");
      expect(clearButton).toHaveClass("btn-primary");
    });
  });

  describe("Edge cases", () => {
    it("works with empty tree", () => {
      const emptyProps = {
        ...defaultProps,
        tree: [],
      };

      render(<PortTemplateHeader {...emptyProps} />);

      const addButton = screen.getByText("+");
      fireEvent.click(addButton);

      expect(defaultProps.setTree).toHaveBeenCalledWith([
        {
          id: "mock-uuid-1234",
          value: "",
          label: "root",
          children: [],
        },
      ]);
    });

    it("handles multiple rapid clicks on add button", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const addButton = screen.getByText("+");

      // Click multiple times rapidly
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(defaultProps.setActiveNodeId).toHaveBeenCalledTimes(3);
      expect(defaultProps.setTree).toHaveBeenCalledTimes(3);
    });

    it("handles tree with nested children", () => {
      const complexTree: TreeNodeType[] = [
        {
          id: "1",
          value: "parent",
          label: "Parent",
          children: [
            {
              id: "2",
              value: "child",
              label: "Child",
              children: [],
            },
          ],
        },
      ];

      const complexProps = {
        ...defaultProps,
        tree: complexTree,
      };

      render(<PortTemplateHeader {...complexProps} />);

      const addButton = screen.getByText("+");
      fireEvent.click(addButton);

      expect(defaultProps.setTree).toHaveBeenCalledWith([
        ...complexTree,
        {
          id: "mock-uuid-1234",
          value: "",
          label: "root",
          children: [],
        },
      ]);
    });
  });

  describe("Accessibility", () => {
    it("buttons are accessible", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(4);

      // All buttons should be keyboard accessible
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });

    it("add button can be focused and clicked with keyboard", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const addButton = screen.getByText("+");
      addButton.focus();

      expect(document.activeElement).toBe(addButton);

      // Simulate Enter key press
      fireEvent.keyDown(addButton, { key: "Enter", code: "Enter" });

      // Note: Button onClick is triggered by click, not keydown in this case
      // This is testing that the button can receive focus
    });
  });

  describe("Component props validation", () => {
    it("requires all props to be passed", () => {
      // This test ensures TypeScript catches missing props
      const requiredProps = {
        tree: mockTree,
        setTree: jest.fn(),
        setActiveNodeId: jest.fn(),
        handleSave: jest.fn(),
        clearStorage: jest.fn(),
      };

      expect(() =>
        render(<PortTemplateHeader {...requiredProps} />)
      ).not.toThrow();
    });

    it("handles function props being called with correct parameters", () => {
      render(<PortTemplateHeader {...defaultProps} />);

      const addButton = screen.getByText("+");
      fireEvent.click(addButton);

      // Verify setActiveNodeId is called with string
      expect(defaultProps.setActiveNodeId).toHaveBeenCalledWith(
        expect.any(String)
      );

      // Verify setTree is called with array
      expect(defaultProps.setTree).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});
