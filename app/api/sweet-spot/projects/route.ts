import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { convergenceIds = [] } = await req.json().catch(() => ({ convergenceIds: [] }));
  const projects = (convergenceIds as string[]).map((id, index) => ({
    id: `proj_${id}_${index}`,
    title: `Projet base sur ${id}`,
    description: "Description mock",
    viability: 0.75,
    convergenceId: id,
  }));
  return NextResponse.json(projects);
}
