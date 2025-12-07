// src/functions/comments.ts
import { supabase } from '@/lib/supabase'

export async function createComment(projectId: string, authorId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      project_id: projectId,
      author_id: authorId,
      content
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}

export async function reportComment(commentId: string, reporterId: string, content: string) {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      comment_id: commentId,
      reporter_id: reporterId,
      content
    })
    .select()
    .single()

  if (error) throw error
  return data
}