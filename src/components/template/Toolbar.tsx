/**
 * Toolbar component for a tree node.
 *
 * Renders a compact set of controls for a node:
 * - A ToggleSwitch to toggle the node's read-only state.
 * - A delete Button to remove the node.
 * - An add Button to create a child node.
 *
 * The ToggleSwitch reflects `node.readOnly` (defaults to false) and, when changed,
 * calls `onUpdate` with a shallow copy of the node ({ ...node, readOnly: checked })
 * to avoid mutating the original prop. The delete and add buttons call `onDelete`
 * and `onAdd` respectively with the node's id.
 *
 * @param props.node - The TreeNodeType instance this toolbar controls. Used to derive id and readOnly state.
 * @param props.onAdd - Callback invoked with the node id when the add button is clicked (intended to create a child).
 * @param props.onDelete - Callback invoked with the node id when the delete button is clicked.
 * @param props.onUpdate - Callback invoked with the node id and the updated node when any node property is changed.
 * @returns A JSX element containing the toolbar controls.
 *
 */
import type { TreeNodeType } from "../../types/TreeNode";
import { Button } from "../ui/Buton";
import { ToggleSwitch } from "../ui/ToggleSwitch";

export interface ToolbarProps {
  node: TreeNodeType;
  onAdd: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedNode: TreeNodeType) => void;
}

export function Toolbar({ node, onAdd, onDelete, onUpdate }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 ml-auto">
      <div className="flex items-center gap-1 bg-gray-100 py-.5 px-2 shadow-md">
        <ToggleSwitch
          onChange={(checked) =>
            onUpdate(node.id, { ...node, readOnly: checked })
          }
          checked={node.readOnly || false}
          label="Read only"
        />
        <Button variant="ghost" onClick={() => onDelete(node.id)}>
          🗑
        </Button>
      </div>
      <Button variant="dashed" onClick={() => onAdd(node.id)}>
        +
      </Button>
    </div>
  );
}
