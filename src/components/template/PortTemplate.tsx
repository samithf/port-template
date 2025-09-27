/**
 * PortTemplate
 *
 * Main component for the port template UI.
 * Uses usePortTemplate for state/actions and renders PortTemplateHeader plus a list of TreeNode.
 *
 * @returns JSX.Element
 */
import { TreeNode } from "./TreeNode";
import { PortTemplateHeader } from "./PortTemplateHeader";
import { usePortTemplate } from "../../hooks/usePortTemplate";

export function PortTemplate() {
  const {
    addNode,
    deleteNode,
    updateNode,
    handleSave,
    clearStorage,
    activeNodeId,
    setActiveNodeId,
    tree,
    setTree,
  } = usePortTemplate();

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
