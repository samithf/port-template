import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { TreeNodeType } from "../../types/TreeNode";
import { TreeNode } from "./TreeNode";
import { PortTemplateHeader } from "./PortTemplateHeader";

export function PortTemplate() {
  const [tree, setTree] = useState<TreeNodeType[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    const savedTree = localStorage.getItem("treeData");
    if (savedTree) {
      setTree(JSON.parse(savedTree));
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

  return (
    <div className="p-6 max-w-[700px] mx-auto">
      <PortTemplateHeader
        tree={tree}
        setTree={setTree}
        setActiveNodeId={setActiveNodeId}
        handleSave={handleSave}
        clearStorage={clearStorage}
      />
      <div>
        {tree.map((node, idx) => (
          <TreeNode
            key={node.id}
            node={node}
            onAdd={addNode}
            onDelete={deleteNode}
            onUpdate={updateNode}
            activeNodeId={activeNodeId}
            setActiveNodeId={setActiveNodeId}
            treeLength={tree.length}
            isLast={idx === tree.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
