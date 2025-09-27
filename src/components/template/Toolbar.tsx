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
