import { connectMongoDB } from "@/lib/mongodb";
import Problem from "@/models/problem";
import { NextResponse } from "next/server";
import { demzaSafeEval } from "@/lib/utils.mjs";

export async function POST(req, { params }) {
  const { id } = await params;

  const body = await req.json()
    .catch(() => null);

  if (!body || !body.studentCode) {
    return NextResponse.json('Invalid Body', { status: 400 });
  }

  const { studentCode } = body;

  await connectMongoDB();

  const problem = await Problem.findById(id)
    .catch((e) => {
      console.log(e)
      return null;
    });

  if (!problem) {
    return NextResponse.json(`Invalid ID (${id})`, { status: 400 });
  }

  const results = [];

  let count = 0;
  const expected = problem.testcases.length;
  for (const tc of problem.testcases) {
    const output = demzaSafeEval(`${studentCode};;solve(JSON.parse("${tc.input}"));`);
    const satisfied = output.trim().includes(tc.output);
    if (satisfied) count++;

    results.push({
      testCaseId: tc._id,
      testCaseInput: tc.input,
      expectedOutput: tc.output,
      realOutput: output.trim(),
      satisfied,
    })
  }

  const pass = count == expected;

  return NextResponse.json({
    pass,
    results,
    score: pass ? problem.score : 0,
  }, { status: 200 });
}
