/**
 * Renders a single node in a recursive tree UI.
 *
 * The TreeNode component displays:
 * - a connector line that visually links the node to its parent/children,
 * - an editable text input for the node's value (unless readOnly),
 * - an inline toolbar when the node is active,
 * - its children as nested TreeNode components.
 *
 * The component calculates the total visual height occupied by the node's
 * descendant subtree to correctly size vertical connector lines.
 *
 * @remarks
 * - The component is controlled in part by the `activeNodeId` prop to determine
 *   whether the node's toolbar should be shown.
 * - The node's value is kept in local state (`fieldValue`) and any changes are
 *   propagated upward via the `onUpdate` callback.
 * - Recursion: each child in `node.children` is rendered as its own TreeNode.
 *
 * @param props.node - The tree node data (value, id, children, readOnly flag, etc.).
 * @param props.onAdd - Callback invoked with the current node id to add a child.
 * @param props.onDelete - Callback invoked with a node id to delete that node.
 * @param props.onUpdate - Callback invoked with (nodeId, updatedNode) whenever the node is updated.
 * @param props.isLast - True if this node is the last sibling; used to adjust connector rendering.
 * @param props.activeNodeId - Id of the currently active node; used to toggle the toolbar.
 * @param props.setActiveNodeId - Setter to mark a node as active (or null to clear).
 * @param props.treeLength - Total number of nodes in the tree (provided for contextual layout; not required for basic rendering).
 *
 * @returns A JSX element representing the node and its nested children.
 */

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

const NODE_HEIGHT = 28; // Height of each node box in pixels

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
           ${isLast ? `!h-[${NODE_HEIGHT}px]` : `!h-[${allNodeHeight}px]`}
          w-px bg-gray-200
        `}
        ></span>
      ) : (
        <span
          className={`
          absolute left-2 -top-[8px] bottom-0
          ${isLast ? `!h-[${NODE_HEIGHT}px]` : ""}
          w-px bg-gray-200
        `}
        ></span>
      )}

      {/* Node Box */}
      <div className="flex items-center gap-2 mb-2 relative">
        <div className="relative before:content-[''] before:absolute before:-left-8 before:top-1/2 before:-translate-y-1/2 before:w-8 before:h-px before:bg-gray-200">
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
