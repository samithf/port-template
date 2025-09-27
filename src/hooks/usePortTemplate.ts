import { useEffect, useState } from "react";
import type { TreeNodeType } from "../types/TreeNode";
import { v4 as uuidv4 } from "uuid";

/**
 * Hook to manage a TreeNodeType[] with localStorage persistence.
 *
 * - Loads "treeData" on mount.
 * - addNode(parentId), deleteNode(id), updateNode(id, node) mutate the in-memory tree.
 * - handleSave() persists to localStorage; clearStorage() clears it and resets state.
 *
 * Returns { addNode, deleteNode, updateNode, handleSave, clearStorage, activeNodeId, setActiveNodeId, tree, setTree }.
 */
export function usePortTemplate() {
  const [tree, setTree] = useState<TreeNodeType[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    const savedTree = localStorage.getItem("treeData");
    if (savedTree) {
      try {
        setTree(JSON.parse(savedTree));
      } catch (error) {
        console.warn("Failed to parse saved tree data:", error);
        setTree([]);
      }
    }
  }, []);

  const addNode = (parentId: string) => {
    const newNode: TreeNodeType = {
      id: uuidv4(),
      label: "child",
      value: "",
      children: [],
    };
    const updateTree = (nodes: TreeNodeType[]): TreeNodeType[] =>
      nodes.map((node) =>
        node.id === parentId
          ? { ...node, children: [...node.children, newNode] }
          : { ...node, children: updateTree(node.children) }
      );
    setActiveNodeId(newNode.id);
    setTree(updateTree(tree));
  };

  const deleteNode = (nodeId: string) => {
    const updateTree = (nodes: TreeNodeType[]): TreeNodeType[] =>
      nodes
        .filter((n: TreeNodeType) => n.id !== nodeId)
        .map((n: TreeNodeType) => ({ ...n, children: updateTree(n.children) }));
    setTree(updateTree(tree));
  };

  const updateNode = (nodeId: string, node: TreeNodeType) => {
    const updateTree = (nodes: TreeNodeType[]): TreeNodeType[] =>
      nodes.map((n: TreeNodeType) =>
        n.id === nodeId
          ? { ...n, ...node }
          : { ...n, children: updateTree(n.children) }
      );
    setTree(updateTree(tree));
  };

  const handleSave = () => {
    localStorage.setItem("treeData", JSON.stringify(tree));
    alert("Template saved to localStorage!");
  };

  const clearStorage = () => {
    localStorage.removeItem("treeData");
    setTree([]);
    setActiveNodeId(null);
    alert("Local storage cleared!");
  };

  return {
    addNode,
    deleteNode,
    updateNode,
    handleSave,
    clearStorage,
    activeNodeId,
    setActiveNodeId,
    tree,
    setTree,
  };
}
