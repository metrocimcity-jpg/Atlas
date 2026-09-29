import { usePrisma } from "@/state/store";
import { CirclePackCanvas } from "@/ui/visualization/CirclePackCanvas";
import { FoamCanvas } from "@/ui/visualization/FoamCanvas";
import { SequencesSunburstCanvas } from "@/ui/visualization/SequencesSunburstCanvas";
import { SunburstCanvas } from "@/ui/visualization/SunburstCanvas";

export function VizStage(): JSX.Element {
  const { config } = usePrisma();
  const renderer = config.visualization.renderer ?? "foamtree";
  if (renderer === "circlePacking") {
    return <CirclePackCanvas />;
  }
  if (renderer === "sequencesSunburst") {
    return <SequencesSunburstCanvas />;
  }
  if (renderer === "sunburst") {
    return <SunburstCanvas />;
  }
  return <FoamCanvas />;
}
