/**
 * Header component for the port template editor.
 *
 * Renders controls for adding a new root node, navigating back, saving the template,
 * and clearing persisted storage. The "add" action generates a new UUID, appends a
 * root node to the provided tree, and sets the new node as the active node.
 *
 * @param props - Component props
 * @param props.tree - The current tree of nodes representing the port template.
 * @param props.setTree - Function to update the tree state.
 * @param props.setActiveNodeId - Function to set the currently active node ID (or null to clear).
 * @param props.handleSave - Callback invoked when the Save button is clicked.
 * @param props.clearStorage - Callback invoked when the Clear Storage button is clicked.
 *
 * @remarks
 * - The UI groups action buttons on the right and uses a dashed variant for the "add" button.
 * - New nodes are created with an empty value and label "root".
 *
 * @returns A JSX element containing the header and its action buttons.
 */
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
