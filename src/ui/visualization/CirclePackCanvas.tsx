import { actions, usePrisma } from "@/state/store";
import type { VizNode } from "@/visualization/types";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface PackDatum {
  name: string;
  id: string;
  sourceId: string | null;
  nodeType: VizNode["nodeType"];
  value?: number;
  children?: PackDatum[];
}

function toPackDatum(node: VizNode): PackDatum {
  if (node.children.length === 0) {
    return {
      name: node.label,
      id: node.id,
      sourceId: node.sourceId,
      nodeType: node.nodeType,
      value: Math.max(node.weight || node.size || 1, 1),
    };
  }
  return {
    name: node.label,
    id: node.id,
    sourceId: node.sourceId,
    nodeType: node.nodeType,
    children: node.children.map(toPackDatum),
  };
}

function resolveId(d: d3.HierarchyCircularNode<PackDatum>): string | null {
  return d.data.sourceId ?? d.data.id ?? null;
}

export function CirclePackCanvas(): JSX.Element {
  const { vizTree, config, selectedId } = usePrisma();
  const hostRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const circlesRef = useRef<d3.Selection<
    SVGCircleElement,
    d3.HierarchyCircularNode<PackDatum>,
    SVGGElement,
    unknown
  > | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !vizTree) {
      if (host) {
        host.replaceChildren();
      }
      circlesRef.current = null;
      return;
    }

    const data = toPackDatum(vizTree);
    const width = Math.max(host.clientWidth || 928, 320);
    const height = Math.max(host.clientHeight || width, 320);
    const size = Math.min(width, height);

    const color = d3
      .scaleLinear<string>()
      .domain([0, 5])
      .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
      .interpolate(d3.interpolateHcl);

    const root = d3.pack<PackDatum>().size([size, size]).padding(3)(
      d3
        .hierarchy(data)
        .sum((d) => d.value ?? 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    );

    host.replaceChildren();
    const svg = d3
      .select(host)
      .append("svg")
      .attr("viewBox", `-${size / 2} -${size / 2} ${size} ${size}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr(
        "style",
        `max-width: 100%; max-height: 100%; display: block; margin: 0 auto; background: ${color(0)}; cursor: pointer;`,
      );

    let focus: d3.HierarchyCircularNode<PackDatum> = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2];

    const node = svg
      .append("g")
      .selectAll<SVGCircleElement, d3.HierarchyCircularNode<PackDatum>>("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
      .attr("stroke-width", 1.5)
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#000");
      })
      .on("mouseout", function (_event, d) {
        const id = resolveId(d);
        d3.select(this).attr("stroke", id && id === selectedRef.current ? "#f08a24" : null);
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        const id = resolveId(d);
        actions.select(id);
        actions.hover(id);
        if (d.children && focus !== d) {
          zoom(event, d);
        }
      })
      .on("dblclick", (event, d) => {
        event.stopPropagation();
        if (d.children || d.data.nodeType !== "file") {
          return;
        }
        const id = resolveId(d);
        if (!id) {
          return;
        }
        actions.select(id);
        void actions.openNode(id);
      });

    circlesRef.current = node;

    const label = svg
      .append("g")
      .style("font", "10px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => d.data.name);

    svg.on("click", (event) => zoom(event, root));

    function zoomTo(v: [number, number, number]): void {
      const k = size / v[2];
      view = v;
      label.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", (d) => d.r * k);
    }

    function zoom(event: { altKey?: boolean }, d: d3.HierarchyCircularNode<PackDatum>): void {
      focus = d;
      const duration = event.altKey ? 7500 : config.visualization.animation ? 750 : 0;
      const transition = svg.transition().duration(duration).tween("zoom", () => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2] as [number, number, number]);
        return (t) => zoomTo(i(t));
      });

      label
        .filter(function (d) {
          return d.parent === focus || (this as SVGTextElement).style.display === "inline";
        })
        .transition()
        .duration(duration)
        .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
        .on("start", function (d) {
          if (d.parent === focus) {
            (this as SVGTextElement).style.display = "inline";
          }
        })
        .on("end", function (d) {
          if (d.parent !== focus) {
            (this as SVGTextElement).style.display = "none";
          }
        });

      void transition;
    }

    zoomTo([focus.x, focus.y, focus.r * 2]);
    node.attr("stroke", (d) => {
      const id = resolveId(d);
      return id && id === selectedRef.current ? "#f08a24" : null;
    });

    return () => {
      circlesRef.current = null;
      host.replaceChildren();
    };
  }, [vizTree, config.visualization.animation, config.visualization.groupBy, config.visualization.sizeBy, config.visualization.colorBy]);

  useEffect(() => {
    const sel = circlesRef.current;
    if (!sel) {
      return;
    }
    sel.attr("stroke", (d) => {
      const id = resolveId(d);
      return id && id === selectedId ? "#f08a24" : null;
    });
  }, [selectedId]);

  return <div className="viz-stage circle-pack-host" ref={hostRef} />;
}
