import { renderHook, act } from "@testing-library/react";
import { usePortTemplate } from "./usePortTemplate";
import type { TreeNodeType } from "../types/TreeNode";

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "localStorage", { value: localStorageMock });
window.alert = jest.fn();

const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

// Mock UUID
let uuidCounter = 0;
jest.mock("uuid", () => ({
  v4: jest.fn(() => `mock-uuid-${++uuidCounter}`),
}));

describe("usePortTemplate Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    uuidCounter = 0;
    window.alert = jest.fn();
    consoleWarnSpy.mockClear();
  });

  describe("Initial State", () => {
    it("should initialize with empty tree and no active node", () => {
      const { result } = renderHook(() => usePortTemplate());

      expect(result.current.tree).toEqual([]);
      expect(result.current.activeNodeId).toBeNull();
    });

    it("should provide all expected functions", () => {
      const { result } = renderHook(() => usePortTemplate());

      expect(typeof result.current.addNode).toBe("function");
      expect(typeof result.current.deleteNode).toBe("function");
      expect(typeof result.current.updateNode).toBe("function");
      expect(typeof result.current.handleSave).toBe("function");
      expect(typeof result.current.clearStorage).toBe("function");
      expect(typeof result.current.setActiveNodeId).toBe("function");
      expect(typeof result.current.setTree).toBe("function");
    });
  });

  describe("LocalStorage Integration", () => {
    it("should load tree data from localStorage on mount", () => {
      const savedTree: TreeNodeType[] = [
        {
          id: "saved-1",
          label: "saved-root",
          value: "saved value",
          children: [],
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTree));

      const { result } = renderHook(() => usePortTemplate());

      expect(localStorageMock.getItem).toHaveBeenCalledWith("treeData");
      expect(result.current.tree).toEqual(savedTree);
    });

    it("should handle invalid JSON in localStorage gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      // Should not throw an error
      const { result } = renderHook(() => usePortTemplate());

      // Should initialize with empty tree
      expect(result.current.tree).toEqual([]);

      // Should log a warning about the invalid JSON
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to parse saved tree data:",
        expect.any(SyntaxError)
      );
    });

    it("should handle null localStorage data", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => usePortTemplate());

      expect(result.current.tree).toEqual([]);
    });

    it("should save tree data to localStorage when handleSave is called", () => {
      const { result } = renderHook(() => usePortTemplate());

      // Set up some tree data
      const testTree: TreeNodeType[] = [
        {
          id: "test-1",
          label: "test-root",
          value: "test value",
          children: [],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      act(() => {
        result.current.handleSave();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "treeData",
        JSON.stringify(testTree)
      );
      expect(window.alert).toHaveBeenCalledWith(
        "Template saved to localStorage!"
      );
    });

    it("should clear localStorage and reset state when clearStorage is called", () => {
      const { result } = renderHook(() => usePortTemplate());

      // Set up some initial state
      const testTree: TreeNodeType[] = [
        { id: "test-1", label: "test", value: "test", children: [] },
      ];

      act(() => {
        result.current.setTree(testTree);
        result.current.setActiveNodeId("test-1");
      });

      // Clear storage
      act(() => {
        result.current.clearStorage();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("treeData");
      expect(result.current.tree).toEqual([]);
      expect(result.current.activeNodeId).toBeNull();
      expect(window.alert).toHaveBeenCalledWith("Local storage cleared!");
    });
  });

  describe("addNode", () => {
    it("should add a child node to a root node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const rootNode: TreeNodeType = {
        id: "root-1",
        label: "root",
        value: "root value",
        children: [],
      };

      act(() => {
        result.current.setTree([rootNode]);
      });

      act(() => {
        result.current.addNode("root-1");
      });

      expect(result.current.tree).toHaveLength(1);
      expect(result.current.tree[0].children).toHaveLength(1);
      expect(result.current.tree[0].children[0]).toMatchObject({
        id: "mock-uuid-1",
        label: "child",
        value: "",
        children: [],
      });
      expect(result.current.activeNodeId).toBe("mock-uuid-1");
    });

    it("should add a child node to a nested node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const nestedTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "root",
          value: "root",
          children: [
            {
              id: "child-1",
              label: "child",
              value: "child",
              children: [],
            },
          ],
        },
      ];

      act(() => {
        result.current.setTree(nestedTree);
      });

      act(() => {
        result.current.addNode("child-1");
      });

      expect(result.current.tree[0].children[0].children).toHaveLength(1);
      expect(result.current.tree[0].children[0].children[0]).toMatchObject({
        id: "mock-uuid-1",
        label: "child",
        value: "",
        children: [],
      });
      expect(result.current.activeNodeId).toBe("mock-uuid-1");
    });

    it("should not modify tree if parent ID is not found", () => {
      const { result } = renderHook(() => usePortTemplate());

      const originalTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "root",
          value: "root",
          children: [],
        },
      ];

      act(() => {
        result.current.setTree(originalTree);
      });

      act(() => {
        result.current.addNode("non-existent-id");
      });

      expect(result.current.tree).toEqual(originalTree);
      expect(result.current.activeNodeId).toBe("mock-uuid-1"); // Still sets active node
    });

    it("should generate unique IDs for each new node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const rootNode: TreeNodeType = {
        id: "root-1",
        label: "root",
        value: "root",
        children: [],
      };

      act(() => {
        result.current.setTree([rootNode]);
      });

      act(() => {
        result.current.addNode("root-1");
      });

      act(() => {
        result.current.addNode("root-1");
      });

      expect(result.current.tree[0].children).toHaveLength(2);
      expect(result.current.tree[0].children[0].id).toBe("mock-uuid-1");
      expect(result.current.tree[0].children[1].id).toBe("mock-uuid-2");
    });
  });

  describe("deleteNode", () => {
    it("should delete a root node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        { id: "root-1", label: "root1", value: "value1", children: [] },
        { id: "root-2", label: "root2", value: "value2", children: [] },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      act(() => {
        result.current.deleteNode("root-1");
      });

      expect(result.current.tree).toHaveLength(1);
      expect(result.current.tree[0].id).toBe("root-2");
    });

    it("should delete a child node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "root",
          value: "root",
          children: [
            { id: "child-1", label: "child1", value: "value1", children: [] },
            { id: "child-2", label: "child2", value: "value2", children: [] },
          ],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      act(() => {
        result.current.deleteNode("child-1");
      });

      expect(result.current.tree[0].children).toHaveLength(1);
      expect(result.current.tree[0].children[0].id).toBe("child-2");
    });

    it("should delete a deeply nested node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "root",
          value: "root",
          children: [
            {
              id: "child-1",
              label: "child",
              value: "child",
              children: [
                {
                  id: "grandchild-1",
                  label: "grandchild",
                  value: "grandchild",
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      act(() => {
        result.current.deleteNode("grandchild-1");
      });

      expect(result.current.tree[0].children[0].children).toHaveLength(0);
    });

    it("should not modify tree if node ID is not found", () => {
      const { result } = renderHook(() => usePortTemplate());

      const originalTree: TreeNodeType[] = [
        { id: "root-1", label: "root", value: "root", children: [] },
      ];

      act(() => {
        result.current.setTree(originalTree);
      });

      act(() => {
        result.current.deleteNode("non-existent-id");
      });

      expect(result.current.tree).toEqual(originalTree);
    });

    it("should delete node and its children recursively", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "root",
          value: "root",
          children: [
            {
              id: "child-1",
              label: "child",
              value: "child",
              children: [
                {
                  id: "grandchild-1",
                  label: "grandchild",
                  value: "grandchild",
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      act(() => {
        result.current.deleteNode("child-1");
      });

      expect(result.current.tree[0].children).toHaveLength(0);
      // Grandchild should also be gone as it was part of the deleted subtree
    });
  });

  describe("updateNode", () => {
    it("should update a root node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        { id: "root-1", label: "root", value: "original", children: [] },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      const updatedNode: TreeNodeType = {
        id: "root-1",
        label: "updated-root",
        value: "updated value",
        children: [],
      };

      act(() => {
        result.current.updateNode("root-1", updatedNode);
      });

      expect(result.current.tree[0]).toMatchObject({
        id: "root-1",
        label: "updated-root",
        value: "updated value",
        children: [],
      });
    });

    it("should update a child node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "root",
          value: "root",
          children: [
            { id: "child-1", label: "child", value: "original", children: [] },
          ],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      const updatedChild: TreeNodeType = {
        id: "child-1",
        label: "updated-child",
        value: "updated value",
        children: [],
      };

      act(() => {
        result.current.updateNode("child-1", updatedChild);
      });

      expect(result.current.tree[0].children[0]).toMatchObject({
        id: "child-1",
        label: "updated-child",
        value: "updated value",
        children: [],
      });
    });

    it("should update a deeply nested node", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "root",
          value: "root",
          children: [
            {
              id: "child-1",
              label: "child",
              value: "child",
              children: [
                {
                  id: "grandchild-1",
                  label: "grandchild",
                  value: "original",
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      const updatedGrandchild: TreeNodeType = {
        id: "grandchild-1",
        label: "updated-grandchild",
        value: "updated value",
        children: [],
      };

      act(() => {
        result.current.updateNode("grandchild-1", updatedGrandchild);
      });

      expect(result.current.tree[0].children[0].children[0]).toMatchObject({
        id: "grandchild-1",
        label: "updated-grandchild",
        value: "updated value",
        children: [],
      });
    });

    it("should not modify tree if node ID is not found", () => {
      const { result } = renderHook(() => usePortTemplate());

      const originalTree: TreeNodeType[] = [
        { id: "root-1", label: "root", value: "root", children: [] },
      ];

      act(() => {
        result.current.setTree(originalTree);
      });

      const updateData: TreeNodeType = {
        id: "non-existent-id",
        label: "updated",
        value: "updated",
        children: [],
      };

      act(() => {
        result.current.updateNode("non-existent-id", updateData);
      });

      expect(result.current.tree).toEqual(originalTree);
    });

    it("should merge update data with existing node data", () => {
      const { result } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        {
          id: "root-1",
          label: "original-label",
          value: "original-value",
          children: [
            { id: "existing-child", label: "child", value: "", children: [] },
          ],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      // Update only the value, should preserve other properties
      const partialUpdate: Partial<TreeNodeType> = {
        value: "new-value",
      };

      act(() => {
        result.current.updateNode("root-1", partialUpdate as TreeNodeType);
      });

      expect(result.current.tree[0]).toMatchObject({
        id: "root-1",
        label: "original-label", // Should be preserved
        value: "new-value", // Should be updated
        children: [
          { id: "existing-child", label: "child", value: "", children: [] },
        ], // Should be preserved
      });
    });
  });

  describe("Active Node Management", () => {
    it("should allow setting active node ID", () => {
      const { result } = renderHook(() => usePortTemplate());

      act(() => {
        result.current.setActiveNodeId("test-node-id");
      });

      expect(result.current.activeNodeId).toBe("test-node-id");
    });

    it("should allow clearing active node ID", () => {
      const { result } = renderHook(() => usePortTemplate());

      act(() => {
        result.current.setActiveNodeId("test-node-id");
      });

      act(() => {
        result.current.setActiveNodeId(null);
      });

      expect(result.current.activeNodeId).toBeNull();
    });

    it("should set active node when adding a child", () => {
      const { result } = renderHook(() => usePortTemplate());

      const rootNode: TreeNodeType = {
        id: "root-1",
        label: "root",
        value: "root",
        children: [],
      };

      act(() => {
        result.current.setTree([rootNode]);
      });

      act(() => {
        result.current.addNode("root-1");
      });

      expect(result.current.activeNodeId).toBe("mock-uuid-1");
    });

    it("should clear active node when clearing storage", () => {
      const { result } = renderHook(() => usePortTemplate());

      act(() => {
        result.current.setActiveNodeId("test-node-id");
      });

      act(() => {
        result.current.clearStorage();
      });

      expect(result.current.activeNodeId).toBeNull();
    });
  });

  describe("Tree State Management", () => {
    it("should allow direct tree state manipulation", () => {
      const { result } = renderHook(() => usePortTemplate());

      const newTree: TreeNodeType[] = [
        { id: "custom-1", label: "custom", value: "custom", children: [] },
      ];

      act(() => {
        result.current.setTree(newTree);
      });

      expect(result.current.tree).toEqual(newTree);
    });

    it("should maintain tree state across re-renders", () => {
      const { result, rerender } = renderHook(() => usePortTemplate());

      const testTree: TreeNodeType[] = [
        {
          id: "persistent-1",
          label: "persistent",
          value: "persistent",
          children: [],
        },
      ];

      act(() => {
        result.current.setTree(testTree);
      });

      rerender();

      expect(result.current.tree).toEqual(testTree);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tree operations gracefully", () => {
      const { result } = renderHook(() => usePortTemplate());

      // Try to add to non-existent parent
      act(() => {
        result.current.addNode("non-existent");
      });

      // Try to delete non-existent node
      act(() => {
        result.current.deleteNode("non-existent");
      });

      // Try to update non-existent node
      act(() => {
        result.current.updateNode("non-existent", {
          id: "test",
          label: "test",
          value: "test",
          children: [],
        });
      });

      expect(result.current.tree).toEqual([]);
    });

    it("should handle malformed localStorage data", () => {
      localStorageMock.getItem.mockReturnValue("not-valid-json");

      const { result } = renderHook(() => usePortTemplate());

      expect(result.current.tree).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to parse saved tree data:",
        expect.any(SyntaxError)
      );
    });

    it("should handle saving empty tree", () => {
      const { result } = renderHook(() => usePortTemplate());

      act(() => {
        result.current.handleSave();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("treeData", "[]");
      expect(window.alert).toHaveBeenCalledWith(
        "Template saved to localStorage!"
      );
    });
  });
});
