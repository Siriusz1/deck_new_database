
// src/functions/drafts.ts
import type { Draft } from '@/entities/project'
import type { CreateProjectFormSchema } from '@/hooks/project/use-publish-project'
import { supabase } from '@/lib/supabase'

export async function getDraftDetails(draftId: string) {
  const { data: draft, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', draftId)
    .eq('status', 'DRAFT')
    .single()

  if (error) throw error

  // Buscar trilhas do rascunho
  const { data: draftTrails } = await supabase
    .from('project_trails')
    .select('trail_id')
    .eq('project_id', draftId)

  // Buscar professores do rascunho
  const { data: draftProfessors } = await supabase
    .from('project_professors')
    .select('professor_id')
    .eq('project_id', draftId)

  const draftData: Draft = {
    id: draft.id,
    title: draft.title,
    description: draft.description,
    bannerUrl: draft.banner_url || '',
    content: draft.content || '',
    publishedYear: draft.published_year,
    semester: draft.semester,
    allowComments: draft.allow_comments,
    createdAt: new Date(draft.created_at),
    updatedAt: new Date(draft.updated_at),
    subjectId: draft.subject_id || '',
    trailsIds: draftTrails?.map(t => t.trail_id) || [],
    professorsIds: draftProfessors?.map(p => p.professor_id) || []
  }

  return draftData
}

export async function createDraft(project: CreateProjectFormSchema, authorId: string) {
  const { data: draft, error } = await supabase
    .from('projects')
    .insert({
      title: project.title,
      description: project.description,
      content: project.content,
      published_year: project.publishedYear,
      status: 'DRAFT',
      semester: project.semester,
      allow_comments: project.allowComments,
      author_id: authorId,
      subject_id: project.subjectId
    })
    .select()
    .single()

  if (error) throw error

  // Inserir trilhas
  if (project.trailsIds) {
    const trailInserts = project.trailsIds.map(trailId => ({
      project_id: draft.id,
      trail_id: trailId
    }))
    await supabase.from('project_trails').insert(trailInserts)
  }

  // Inserir professores
  if (project.professorsIds) {
    const professorInserts = project.professorsIds.map(professorId => ({
      project_id: draft.id,
      professor_id: professorId
    }))
    await supabase.from('project_professors').insert(professorInserts)
  }

  return draft.id
}

export async function saveDraft(draftId: string, project: CreateProjectFormSchema) {
  const { error: updateError } = await supabase
    .from('projects')
    .update({
      title: project.title,
      description: project.description,
      content: project.content,
      published_year: project.publishedYear,
      semester: project.semester,
      allow_comments: project.allowComments,
      subject_id: project.subjectId
    })
    .eq('id', draftId)

  if (updateError) throw updateError

  // Atualizar trilhas
  await supabase.from('project_trails').delete().eq('project_id', draftId)
  
  if (project.trailsIds) {
    const trailInserts = project.trailsIds.map(trailId => ({
      project_id: draftId,
      trail_id: trailId
    }))
    await supabase.from('project_trails').insert(trailInserts)
  }

  // Atualizar professores
  await supabase.from('project_professors').delete().eq('project_id', draftId)
  
  if (project.professorsIds) {
    const professorInserts = project.professorsIds.map(professorId => ({
      project_id: draftId,
      professor_id: professorId
    }))
    await supabase.from('project_professors').insert(professorInserts)
  }
}
