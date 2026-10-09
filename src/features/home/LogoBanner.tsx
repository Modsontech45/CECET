import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Card3D } from '@/components/ui/Card3D'
import { ease } from '@/lib/motion'

const CONCEPTS = [
  {
    id: 'c1',
    src: '/logos/concept1-union-des-personnes-logo-fond-vert.png',
    iconSrc: '/logos/concept1-union-des-personnes-symbole.png',
    name: 'Union des Personnes',
    desc: "Trois personnes unies autour du YEM, symbolisant la solidarité humaine.",
  },
  {
    id: 'c2',
    src: '/logos/concept2-cercle-echange-logo-fond-vert.png',
    iconSrc: '/logos/concept2-cercle-echange-symbole.png',
    name: "Cercle d'Échange",
    desc: "Un cycle d'échange fluide représentant la circulation des ressources et du YEM.",
  },
  {
    id: 'c3',
    src: '/logos/concept3-mains-solidaires-logo-fond-vert.png',
    iconSrc: '/logos/concept3-mains-solidaires-symbole.png',
    name: 'Mains Solidaires',
    desc: "Trois mains qui se tiennent, incarnant l'entraide et la coopération communautaire.",
  },
]

export function LogoBanner() {
  const { t } = useTranslation()

  return (
    <Section id="identite-visuelle">
      <SectionHeader
        title={t('brand.title', 'Notre Identité Visuelle')}
        subtitle={t('brand.subtitle', 'Trois concepts graphiques qui incarnent les valeurs de CECT Togo — solidarité, échange et entraide.')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-10">
        {CONCEPTS.map((concept, i) => (
          <motion.div
            key={concept.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: ease.out }}
          >
            <Card3D
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              intensity={8}
            >
              {/* Logo image */}
              <div className="relative overflow-hidden bg-[#0f3d22]">
                <img
                  src={concept.src}
                  alt={`CECT Togo — ${concept.name}`}
                  className="w-full h-auto object-cover block"
                  draggable={false}
                />
              </div>

              {/* Card body */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={concept.iconSrc}
                    alt=""
                    aria-hidden
                    className="h-10 w-10 object-contain"
                  />
                  <h3 className="font-bold text-[var(--color-text)] text-sm sm:text-base">
                    {concept.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {concept.desc}
                </p>
              </div>
            </Card3D>
          </motion.div>
        ))}
      </div>

      {/* Horizontal banner strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: ease.out }}
        className="rounded-2xl overflow-hidden grid grid-cols-3 gap-0 shadow-lg"
      >
        {CONCEPTS.map((concept) => (
          <div key={concept.id} className="relative group overflow-hidden">
            <img
              src={concept.src}
              alt={`CECT Togo — ${concept.name}`}
              className="w-full h-28 sm:h-36 object-cover block transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-semibold px-3 text-center">
                {concept.name}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </Section>
  )
}
