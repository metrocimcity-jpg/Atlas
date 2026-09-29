import { actions, usePrisma } from "@/state/store";
import { resetFoamTreeView } from "@/visualization/foamtree/host";
import { focusedVizNode } from "@/visualization/tree";

export function Breadcrumbs(): JSX.Element {
  const { vizTree, focusPath, index } = usePrisma();
  const crumbs = index && vizTree
    ? focusPath.map((id, indexInPath) => {
        const node = focusedVizNode(vizTree, focusPath.slice(0, indexInPath + 1));
        return { id, label: node.label };
      })
    : [];

  return (
    <nav className="crumbbar" aria-label="Hierarchy">
      <button
        className={crumbs.length === 0 ? "crumb current" : "crumb"}
        type="button"
        onClick={() => {
          actions.setFocusPath([]);
          resetFoamTreeView();
        }}
      >
        ⌂ all files
      </button>
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.id}-${index}`} style={{ display: "contents" }}>
          <span className="crumb-sep">›</span>
          <button
            className={index === crumbs.length - 1 ? "crumb current" : "crumb"}
            type="button"
            onClick={() => {
              const next = focusPath.slice(0, index + 1);
              actions.setFocusPath(next);
            }}
          >
            {crumb.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
