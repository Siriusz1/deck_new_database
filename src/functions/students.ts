// src/functions/students.ts
import type { EditProfileModalSchema } from '@/components/profile/profile-card'
import type { Profile } from '@/entities/profile'
import type { RegisterFormSchema } from '@/hooks/auth/use-register'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function getStudentProfile(username: string) {
  // Buscar estudante
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('username', username)
    .single()

  if (studentError) throw studentError

  // Buscar trilhas do estudante
  const { data: studentTrails } = await supabase
    .from('student_trails')
    .select('trail_id, trails(name)')
    .eq('student_id', student.id)

  const trails = studentTrails?.map(st => (st.trails as any).name) || []

  // Buscar projetos publicados
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      banner_url,
      published_year,
      semester,
      subject_id,
      subjects(name),
      created_at
    `)
    .eq('author_id', student.id)
    .eq('status', 'PUBLISHED')

  // Buscar trilhas e professores de cada projeto
  const postsWithDetails = await Promise.all(
    (projects || []).map(async (project) => {
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
        bannerUrl: project.banner_url,
        publishedYear: project.published_year,
        semester: project.semester,
        subject: (project.subjects as any)?.name || '',
        subjectId: project.subject_id || '',
        trails: projectTrails?.map(pt => (pt.trails as any).name) || [],
        professors: projectProfessors?.map(pp => (pp.professors as any).name) || [],
        createdAt: project.created_at
      }
    })
  )

  // Buscar rascunhos
  const { data: drafts } = await supabase
    .from('projects')
    .select('id, title')
    .eq('author_id', student.id)
    .eq('status', 'DRAFT')

  const profile: Profile = {
    id: student.id,
    name: student.name,
    username: student.username,
    semester: student.semester,
    about: student.about || '',
    profileUrl: student.profile_url || '',
    trails,
    posts: postsWithDetails,
    drafts: drafts || []
  }

  return profile
}

export async function searchStudents(searchQuery: string) {
  const params = new URLSearchParams(searchQuery)
  const name = params.get('name') || ''

  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .ilike('name', `%${name}%`)

  if (error) throw error

  // Buscar trilhas de cada estudante
  const studentsWithTrails = await Promise.all(
    students.map(async (student) => {
      const { data: studentTrails } = await supabase
        .from('student_trails')
        .select('trails(name)')
        .eq('student_id', student.id)

      return {
        id: student.id,
        name: student.name,
        username: student.username,
        semester: student.semester,
        profileUrl: student.profile_url || '',
        trails: studentTrails?.map(st => (st.trails as any).name) || []
      }
    })
  )

  return studentsWithTrails
}

export async function uploadProfileImage(file: File, username: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${username}.${fileExt}`
  const filePath = `profiles/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath)

  // Atualizar URL no perfil do estudante
  await supabase
    .from('students')
    .update({ profile_url: data.publicUrl })
    .eq('username', username)

  return data.publicUrl
}

export async function register(data: RegisterFormSchema) {
  // Hash da senha
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Inserir estudante
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      email: data.email,
      password: hashedPassword,
      username: data.username,
      name: `${data.firstName} ${data.lastName}`.trim(),
      semester: data.semester,
      about: data.about
    })
    .select()
    .single()

  if (studentError) throw studentError

  // Inserir trilhas do estudante
  const trailInserts = data.trails.map(trailId => ({
    student_id: student.id,
    trail_id: trailId
  }))

  const { error: trailsError } = await supabase
    .from('student_trails')
    .insert(trailInserts)

  if (trailsError) throw trailsError

  return student
}

export async function editProfile(
  id: string,
  data: EditProfileModalSchema,
  trailsIds: string[]
) {
  // Atualizar dados do estudante
  const { error: updateError } = await supabase
    .from('students')
    .update({
      semester: data.semester,
      about: data.about
    })
    .eq('id', id)

  if (updateError) throw updateError

  // Remover trilhas antigas
  await supabase
    .from('student_trails')
    .delete()
    .eq('student_id', id)

  // Inserir novas trilhas
  const trailInserts = trailsIds.map(trailId => ({
    student_id: id,
    trail_id: trailId
  }))

  const { error: trailsError } = await supabase
    .from('student_trails')
    .insert(trailInserts)

  if (trailsError) throw trailsError
}

export async function authenticateStudent(email: string, password: string) {
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !student) {
    throw new Error('Credenciais inválidas')
  }

  const isPasswordValid = await bcrypt.compare(password, student.password)

  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas')
  }

  return {
    id: student.id,
    email: student.email,
    username: student.username,
    name: student.name
  }
}