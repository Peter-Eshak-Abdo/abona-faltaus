import { NextRequest, NextResponse } from 'next/server';
import { checkAndSendScheduledNotifications } from '@/lib/scheduler';

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkAndSendScheduledNotifications();

    return NextResponse.json({
      success: true,
      message: 'Scheduled notifications checked successfully'
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Failed to check scheduled notifications' },
      { status: 500 }
    );
  }
}
