"use client";

import { useState } from "react";
import type { TreeNodeType } from "../../types/TreeNode";
import { InputText } from "../ui/InputText";
import { Toolbar } from "./Toolbar";

export interface TreeNodeProps {
  node: TreeNodeType;
  onAdd: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, node: TreeNodeType) => void;
  isLast: boolean;
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
  treeLength: number;
}

const NODE_HEIGHT = 26; // Height of each node box in pixels

export function TreeNode({
  node,
  onAdd,
  onDelete,
  onUpdate,
  isLast,
  activeNodeId,
  setActiveNodeId,
  treeLength,
}: TreeNodeProps) {
  const [fieldValue, setFieldValue] = useState(node.value);

  const countDescendants = (n: TreeNodeType): number =>
    n.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);

  const allNodeHeight = NODE_HEIGHT * countDescendants(node);

  return (
    <div className="relative pl-10">
      {/* Connector Lines */}

      {node.label === "root" ? (
        <span
          className={`
          absolute left-2 -top-[8px] bottom-0
           ${isLast ? `h-[${NODE_HEIGHT}px]` : `h-[${allNodeHeight}px]`}
          w-px bg-red-500
        `}
        ></span>
      ) : (
        <span
          className={`
          absolute left-2 -top-[8px] bottom-0
          ${isLast ? `h-[${NODE_HEIGHT}px]` : ""}
          w-px bg-red-500
        `}
        ></span>
      )}

      {/* Node Box */}
      <div className="flex items-center gap-2 mb-2 relative">
        <div className="relative before:content-[''] before:absolute before:-left-8 before:top-1/2 before:-translate-y-1/2 before:w-8 before:h-px before:bg-red-500">
          <InputText
            value={fieldValue}
            onChange={(val) => {
              setFieldValue(val);
              onUpdate(node.id, { ...node, value: val });
            }}
            onClick={() => setActiveNodeId(node.id)}
            readonly={node.readOnly || false}
          />
        </div>
        {activeNodeId === node.id ? (
          <Toolbar
            node={node}
            onAdd={onAdd}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ) : null}
      </div>

      {/* Children */}
      <div className="ml-8">
        {node.children.map((child, idx) => (
          <TreeNode
            key={child.id}
            node={child}
            onAdd={onAdd}
            onDelete={onDelete}
            onUpdate={onUpdate}
            isLast={idx === node.children.length - 1}
            treeLength={treeLength}
            activeNodeId={activeNodeId}
            setActiveNodeId={setActiveNodeId}
          />
        ))}
      </div>
    </div>
  );
}
