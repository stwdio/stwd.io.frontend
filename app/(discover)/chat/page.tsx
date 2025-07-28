import { redirect } from 'next/navigation'

interface OldChatPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OldChatPage({ searchParams }: OldChatPageProps) {
  const params = await searchParams
  const queryString = new URLSearchParams(params as Record<string, string>).toString()
  redirect(`/connect/chat${queryString ? `?${queryString}` : ''}`)
}