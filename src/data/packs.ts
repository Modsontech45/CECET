// PROVISOIRE — valeurs à ratifier par le CA (PO-01, PO-02, PO-03, PO-04)
// Aucune valeur économique n'est en dur dans les composants ; tout passe par ce fichier
// ou par l'API simulée (GET /api/v1/packs).

import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ShoppingCart, Wallet, Store } from 'lucide-react'

// ─── YEM rates (PROVISOIRE — PO-01) ──────────────────────────────────────────
export const YEM_BUY_PRICE      = 500   // PROVISOIRE — F/YEM — achat membre → CECT
export const YEM_SELL_PRICE     = 650   // PROVISOIRE — F/YEM — vente CECT → membre
export const YEM_TRANSFER_PRICE = 610   // PROVISOIRE — F/YEM — cession

// PROVISOIRE — remise consommateur (PO-02) : 2 à 5 % — non encore ratifiée
export const YEM_DISCOUNT_MIN = 2
export const YEM_DISCOUNT_MAX = 5

// ─── Membership fees ─────────────────────────────────────────────────────────
export const MEMBERSHIP_INDIVIDUAL = 25_000   // FCFA — personne physique
export const MEMBERSHIP_COMPANY    = 200_000  // FCFA — personne morale (v4.0)

// ─── Pack families ───────────────────────────────────────────────────────────
export type PackFamilyId = 'vendeur' | 'consommateur' | 'personnel' | 'marchand'

export interface PackFamily {
  id: PackFamilyId
  icon: LucideIcon
  formulas: string     // e.g. "V1–V12"
  maxFormulas: number  // total number of formulas
  forLegal?: boolean   // Marchand only — personne morale
}

export const PACK_FAMILIES: PackFamily[] = [
  {
    id: 'vendeur',
    icon: ArrowUpRight,
    formulas: 'V1–V12',
    maxFormulas: 12,
  },
  {
    id: 'consommateur',
    icon: ShoppingCart,
    formulas: 'C1–C8',
    maxFormulas: 8,
  },
  {
    id: 'personnel',
    icon: Wallet,
    formulas: '',
    maxFormulas: 1,
  },
  {
    id: 'marchand',
    icon: Store,
    formulas: 'M1–M10',
    maxFormulas: 10,
    forLegal: true,
  },
]

// ─── Utility ─────────────────────────────────────────────────────────────────
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}
