import { redirect } from 'next/navigation'

export async function GET() {
  // Lists feature is deprecated in the chat-centric MVP
  redirect('/discover')
}