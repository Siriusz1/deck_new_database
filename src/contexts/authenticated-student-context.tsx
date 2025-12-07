// src/contexts/authenticated-student-context.tsx
'use client'

import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { type ReactNode, createContext, useCallback } from 'react'

import type { Profile } from '@/entities/profile'
import { getStudentProfile } from '@/functions/students'

interface AuthenticatedStudentContextProps {
  student: UseQueryResult<Profile, Error>
}

export const AuthenticatedStudentContext =
  createContext<AuthenticatedStudentContextProps | null>(null)

interface AuthenticatedStudentProvidesProps {
  children: ReactNode
}

export function AuthenticatedStudentProvider({
  children,
}: AuthenticatedStudentProvidesProps) {
  const { data: session } = useSession()

  const getStudentDetails = useCallback(async () => {
    if (!session?.user?.username) {
      throw new Error('No authenticated user')
    }

    const profile = await getStudentProfile(session.user.username)
    return profile
  }, [session])

  const student = useQuery({
    queryKey: ['students', 'me', session?.user?.username],
    queryFn: getStudentDetails,
    enabled: Boolean(session?.user?.username),
  })

  return (
    <AuthenticatedStudentContext.Provider
      value={{
        student,
      }}
    >
      {children}
    </AuthenticatedStudentContext.Provider>
  )
}

// src/types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      username: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    username: string
  }
}