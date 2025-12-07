// src/contexts/tags-context.tsx
'use client'

import { type ReactNode, createContext } from 'react'

import type { Professor } from '@/entities/professor'
import type { Subject } from '@/entities/subject'
import type { Trail } from '@/entities/trail'
import { supabase } from '@/lib/supabase'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'

interface TagsContextProps {
  trails: UseQueryResult<Trail[], Error>
  professors: UseQueryResult<Professor[], Error>
  subjects: UseQueryResult<Subject[], Error>
}

export const TagsContext = createContext<TagsContextProps | null>(null)

interface TagsProvidesProps {
  children: ReactNode
}

export function TagsProvider({ children }: TagsProvidesProps) {
  const trails = useQuery<Trail[]>({
    queryKey: ['trails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trails')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  const professors = useQuery<Professor[]>({
    queryKey: ['professors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  const subjects = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  return (
    <TagsContext.Provider
      value={{
        trails,
        professors,
        subjects,
      }}
    >
      {children}
    </TagsContext.Provider>
  )
}