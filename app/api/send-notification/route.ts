import { NextRequest, NextResponse } from 'next/server';
import { sendDailyVerseNotification } from '@/lib/onesignal';

export async function POST(request: NextRequest) {
  try {
    const { externalUserId } = await request.json();

    if (!externalUserId) {
      return NextResponse.json(
        { error: 'externalUserId is required' },
        { status: 400 }
      );
    }

    // Send daily verse notification
    await sendDailyVerseNotification(externalUserId);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
