import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, feedback, rating } = await request.json();

  if (!feedback || rating === null) {
    return NextResponse.json({ error: 'Feedback and rating are required.' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Assuming a 'feedback' table exists in Supabase with columns:
    // id: uuid (primary key, default gen_random_uuid())
    // created_at: timestampz (default now())
    // name: text (nullable)
    // email: text (nullable)
    // feedback_text: text (not nullable)
    // rating: integer (not nullable, e.g., 1-5)
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          name: name || null,
          email: email || null,
          feedback_text: feedback,
          rating: rating,
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Feedback submitted successfully.', data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error submitting feedback:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
