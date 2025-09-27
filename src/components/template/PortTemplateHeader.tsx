import type { TreeNodeType } from "../../types/TreeNode";
import { Button } from "../ui/Buton";
import { v4 as uuidv4 } from "uuid";

export interface PortTemplateHeaderProps {
  tree: TreeNodeType[];
  setTree: (tree: TreeNodeType[]) => void;
  setActiveNodeId: (id: string | null) => void;
  handleSave: () => void;
  clearStorage: () => void;
}

export function PortTemplateHeader({
  tree,
  setTree,
  setActiveNodeId,
  handleSave,
  clearStorage,
}: PortTemplateHeaderProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant="dashed"
        onClick={() => {
          const id = uuidv4();
          setActiveNodeId(id);
          setTree([...tree, { id, value: "", label: "root", children: [] }]);
        }}
      >
        +
      </Button>
      <div className="ml-auto flex gap-2">
        <Button variant="secondary">Back</Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
        <Button onClick={clearStorage}>Clear Storage</Button>
      </div>
    </div>
  );
}
