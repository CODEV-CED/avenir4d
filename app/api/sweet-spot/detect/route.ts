import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const _body = await req.json().catch(() => null);
  // Mock minimal conforme au mapping dans useSweetSpotConvergences
  const resp = {
    score: 0.66,
    convergences: [
      {
        id: "api_1",
        formula: ["Design", "IA", "Education"],
        result: "Coach d'app creatives",
        description: "...",
        example: "...",
        score: 0.8,
      },
    ],
    metrics: { strongestDimension: "passions", weakestDimension: "viabilite", balance: 0.7 },
  };
  return NextResponse.json(resp);
}

