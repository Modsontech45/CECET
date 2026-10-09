// DEMO — mock users for development / staging only
// Never ship real credentials. Remove before production.

export type UserRole = 'utilisateur' | 'administrateur' | 'superadmin' | 'validateur' | 'comptabilite'

export interface MockUser {
  pernum: string
  email: string
  password: string
  role: UserRole
  name: string
}

export const MOCK_USERS: MockUser[] = [
  {
    pernum: 'CECT-U-0001',
    email: 'membre@demo.cect',
    password: 'Demo1234!',
    role: 'utilisateur',
    name: 'Koffi Mensah',
  },
  {
    pernum: 'CECT-A-0001',
    email: 'admin@demo.cect',
    password: 'Demo1234!',
    role: 'administrateur',
    name: 'Adjoua Koné',
  },
  {
    pernum: 'CECT-S-0001',
    email: 'superadmin@demo.cect',
    password: 'Demo1234!',
    role: 'superadmin',
    name: 'Amavi Dossou',
  },
  {
    pernum: 'CECT-V-0001',
    email: 'validateur@demo.cect',
    password: 'Demo1234!',
    role: 'validateur',
    name: 'Kodjo Addo',
  },
  {
    pernum: 'CECT-C-0001',
    email: 'compta@demo.cect',
    password: 'Demo1234!',
    role: 'comptabilite',
    name: 'Afi Lawson',
  },
]

export function findMockUser(identifier: string, password: string): MockUser | null {
  const id = identifier.trim().toLowerCase()
  return (
    MOCK_USERS.find(
      (u) =>
        (u.email.toLowerCase() === id || u.pernum.toLowerCase() === id) &&
        u.password === password
    ) ?? null
  )
}

export function isAdminRole(role: UserRole): boolean {
  return role !== 'utilisateur'
}
