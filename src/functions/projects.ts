// src/functions/projects.ts
import type { Post, Project } from '@/entities/project'
import type { CreateProjectFormSchema } from '@/hooks/project/use-publish-project'
import { supabase } from '@/lib/supabase'

export async function getProjectDetails(id: string) {
  // Buscar projeto
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      students(name, username, profile_url),
      subjects(name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // Buscar trilhas do projeto
  const { data: projectTrails } = await supabase
    .from('project_trails')
    .select('trails(name)')
    .eq('project_id', id)

  // Buscar professores do projeto
  const { data: projectProfessors } = await supabase
    .from('project_professors')
    .select('professors(name)')
    .eq('project_id', id)

  // Buscar comentários
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      students(name, username, profile_url)
    `)
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const projectData: Project = {
    id: project.id,
    title: project.title,
    description: project.description,
    bannerUrl: project.banner_url || '',
    content: project.content || '',
    publishedYear: project.published_year,
    status: project.status as 'DRAFT' | 'PUBLISHED',
    semester: project.semester,
    allowComments: project.allow_comments,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
    authorId: project.author_id,
    author: {
      name: (project.students as any).name,
      username: (project.students as any).username,
      profileUrl: (project.students as any).profile_url || ''
    },
    subjectId: project.subject_id || '',
    subject: (project.subjects as any)?.name || '',
    trails: projectTrails?.map(pt => (pt.trails as any).name) || [],
    professors: projectProfessors?.map(pp => (pp.professors as any).name) || [],
    comments: comments?.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
      author: {
        name: (c.students as any).name,
        username: (c.students as any).username,
        profileUrl: (c.students as any).profile_url || ''
      },
      authorId: c.author_id
    })) || []
  }

  return projectData
}

export async function fetchPosts() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      students(name, username, profile_url),
      subjects(name)
    `)
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Buscar trilhas e professores de cada projeto
  const postsWithDetails = await Promise.all(
    projects.map(async (project) => {
      const { data: projectTrails } = await supabase
        .from('project_trails')
        .select('trails(name)')
        .eq('project_id', project.id)

      const { data: projectProfessors } = await supabase
        .from('project_professors')
        .select('professors(name)')
        .eq('project_id', project.id)

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        bannerUrl: project.banner_url || '',
        publishedYear: project.published_year,
        status: project.status as 'DRAFT' | 'PUBLISHED',
        semester: project.semester,
        allowComments: project.allow_comments,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        authorId: project.author_id,
        author: {
          name: (project.students as any).name,
          username: (project.students as any).username,
          profileUrl: (project.students as any).profile_url || ''
        },
        subjectId: project.subject_id || '',
        subject: (project.subjects as any)?.name || '',
        trails: projectTrails?.map(pt => (pt.trails as any).name) || [],
        professors: projectProfessors?.map(pp => (pp.professors as any).name) || []
      } as Post
    })
  )

  return postsWithDetails
}

export async function filterPosts(filterParams: string) {
  const params = new URLSearchParams(filterParams)
  const semester = params.get('semester')
  const publishedYear = params.get('publishedYear')
  const subjectId = params.get('subjectId')

  let query = supabase
    .from('projects')
    .select(`
      *,
      students(name, username, profile_url),
      subjects(name)
    `)
    .eq('status', 'PUBLISHED')

  if (semester) {
    query = query.eq('semester', parseInt(semester))
  }

  if (publishedYear) {
    query = query.eq('published_year', parseInt(publishedYear))
  }

  if (subjectId) {
    query = query.eq('subject_id', subjectId)
  }

  const { data: projects, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  // Buscar trilhas e professores de cada projeto
  const postsWithDetails = await Promise.all(
    projects.map(async (project) => {
      const { data: projectTrails } = await supabase
        .from('project_trails')
        .select('trails(name)')
        .eq('project_id', project.id)

      const { data: projectProfessors } = await supabase
        .from('project_professors')
        .select('professors(name)')
        .eq('project_id', project.id)

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        bannerUrl: project.banner_url || '',
        publishedYear: project.published_year,
        status: project.status as 'DRAFT' | 'PUBLISHED',
        semester: project.semester,
        allowComments: project.allow_comments,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        authorId: project.author_id,
        author: {
          name: (project.students as any).name,
          username: (project.students as any).username,
          profileUrl: (project.students as any).profile_url || ''
        },
        subjectId: project.subject_id || '',
        subject: (project.subjects as any)?.name || '',
        trails: projectTrails?.map(pt => (pt.trails as any).name) || [],
        professors: projectProfessors?.map(pp => (pp.professors as any).name) || []
      } as Post
    })
  )

  return postsWithDetails
}

export async function searchPosts(searchQuery: string) {
  const params = new URLSearchParams(searchQuery)
  const title = params.get('title')
  const tag = params.get('tag')
  const professorName = params.get('professorName')

  let query = supabase
    .from('projects')
    .select(`
      *,
      students(name, username, profile_url),
      subjects(name)
    `)
    .eq('status', 'PUBLISHED')

  if (title) {
    query = query.ilike('title', `%${title}%`)
  }

  const { data: projects, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  // Filtrar por tag ou professor se necessário
  let filteredProjects = projects

  if (tag || professorName) {
    filteredProjects = await Promise.all(
      projects.map(async (project) => {
        const { data: projectTrails } = await supabase
          .from('project_trails')
          .select('trails(name)')
          .eq('project_id', project.id)

        const { data: projectProfessors } = await supabase
          .from('project_professors')
          .select('professors(name)')
          .eq('project_id', project.id)

        const trails = projectTrails?.map(pt => (pt.trails as any).name) || []
        const professors = projectProfessors?.map(pp => (pp.professors as any).name) || []

        // Filtrar por tag
        if (tag && !trails.includes(tag)) {
          return null
        }

        // Filtrar por professor
        if (professorName && !professors.some(p => p.toLowerCase().includes(professorName.toLowerCase()))) {
          return null
        }

        return project
      })
    ).then(results => results.filter(p => p !== null))
  }

  // Buscar trilhas e professores de cada projeto
  const postsWithDetails = await Promise.all(
    filteredProjects.map(async (project) => {
      const { data: projectTrails } = await supabase
        .from('project_trails')
        .select('trails(name)')
        .eq('project_id', project.id)

      const { data: projectProfessors } = await supabase
        .from('project_professors')
        .select('professors(name)')
        .eq('project_id', project.id)

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        bannerUrl: project.banner_url || '',
        publishedYear: project.published_year,
        status: project.status as 'DRAFT' | 'PUBLISHED',
        semester: project.semester,
        allowComments: project.allow_comments,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        authorId: project.author_id,
        author: {
          name: (project.students as any).name,
          username: (project.students as any).username,
          profileUrl: (project.students as any).profile_url || ''
        },
        subjectId: project.subject_id || '',
        subject: (project.subjects as any)?.name || '',
        trails: projectTrails?.map(pt => (pt.trails as any).name) || [],
        professors: projectProfessors?.map(pp => (pp.professors as any).name) || []
      } as Post
    })
  )

  return postsWithDetails
}

export async function publishProject(
  project: CreateProjectFormSchema,
  authorId: string,
  draftId: string | null
) {
  // Se for de um rascunho, atualizar
  if (draftId) {
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        title: project.title,
        description: project.description,
        content: project.content,
        published_year: project.publishedYear,
        status: 'PUBLISHED',
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

    return draftId
  }

  // Criar novo projeto
  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      title: project.title,
      description: project.description,
      content: project.content,
      published_year: project.publishedYear,
      status: 'PUBLISHED',
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
      project_id: newProject.id,
      trail_id: trailId
    }))
    await supabase.from('project_trails').insert(trailInserts)
  }

  // Inserir professores
  if (project.professorsIds) {
    const professorInserts = project.professorsIds.map(professorId => ({
      project_id: newProject.id,
      professor_id: professorId
    }))
    await supabase.from('project_professors').insert(professorInserts)
  }

  return newProject.id
}

export async function uploadProjectBanner(file: File, projectId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${projectId}.${fileExt}`
  const filePath = `banners/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('project-banners')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('project-banners')
    .getPublicUrl(filePath)

  // Atualizar URL no projeto
  await supabase
    .from('projects')
    .update({ banner_url: data.publicUrl })
    .eq('id', projectId)

  return data.publicUrl
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}