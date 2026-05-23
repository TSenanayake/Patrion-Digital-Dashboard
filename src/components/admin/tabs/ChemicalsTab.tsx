import ChemicalProductEditor from "@/components/admin/ChemicalProductEditor";

interface ChemicalsTabProps {
  projectId: string;
}

export function ChemicalsTab({ projectId }: ChemicalsTabProps) {
  return <ChemicalProductEditor projectId={projectId} />;
}
