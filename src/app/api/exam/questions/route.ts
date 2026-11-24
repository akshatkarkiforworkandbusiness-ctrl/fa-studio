import { NextResponse } from 'next/server';
import { publicExamQuestions } from '@/lib/exam-bank';

/**
 * Serve the exam paper to the browser with the marking key and worked
 * solutions stripped.
 *
 * Previously the full question bank — including `answer` and `expected` — was
 * imported by a client component and therefore bundled into the page, making
 * every question trivially answerable from DevTools. Keeping the bank in a
 * server-only module and serving it from here means the answers never leave
 * the server until after the student submits.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(publicExamQuestions());
}
