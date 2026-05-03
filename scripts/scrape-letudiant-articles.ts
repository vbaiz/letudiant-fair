import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Manual curated list of L'Étudiant articles for MVP (May-June 2026)
const ARTICLES = [
  {
    title: 'Parcoursup 2026 : Le calendrier officiel et les nouveautés',
    description: 'Découvrez le calendrier complet de Parcoursup 2026 et les changements attendus pour cette année.',
    url: 'https://www.letudiant.fr/etudes/parcoursup.html',
    category: 'Admission',
    rubrique: 'Orientation',
  },
  {
    title: 'Intelligence Artificielle en Formation : Les Masters à Connaître',
    description: 'Les meilleures formations spécialisées en IA en France. Débouchés et compétences clés.',
    url: 'https://www.letudiant.fr/etudes/formations-ia.html',
    category: 'Formation',
    rubrique: 'Métiers',
  },
  {
    title: 'Les Secteurs Qui Recrutent le Plus en 2026',
    description: 'Santé, Tech, Finance : les domaines avec les meilleures perspectives d\'emploi.',
    url: 'https://www.letudiant.fr/etudes/metiers.html',
    category: 'Emploi',
    rubrique: 'Métiers',
  },
  {
    title: 'Études à l\'Étranger : Financement et Bourses Disponibles',
    description: 'Comment financer vos études à l\'étranger ? Bourses Erasmus+ et autres aides.',
    url: 'https://www.letudiant.fr/etudes/etudes-etranger.html',
    category: 'Admission',
    rubrique: 'Mobilité',
  },
  {
    title: 'Apprentissage vs Formation Initiale : Quel Choix ?',
    description: 'Comparaison détaillée entre l\'apprentissage et la formation traditionnelle en 2026.',
    url: 'https://www.letudiant.fr/etudes/apprentissage.html',
    category: 'Formation',
    rubrique: 'Orientation',
  },
  {
    title: 'Les Écoles d\'Ingénieur les Plus Demandées',
    description: 'Top 10 des écoles d\'ingénieur les plus compétitives et leurs conditions d\'admission.',
    url: 'https://www.letudiant.fr/etudes/ecoles-ingenieurs.html',
    category: 'Formation',
    rubrique: 'Écoles',
  },
  {
    title: 'Business School : Comment Réussir le Concours ?',
    description: 'Stratégie de préparation aux concours des écoles de commerce 2026.',
    url: 'https://www.letudiant.fr/etudes/ecoles-commerce.html',
    category: 'Admission',
    rubrique: 'Écoles',
  },
  {
    title: 'Santé Mentale des Étudiants : Ressources et Soutien',
    description: 'Guide complet des services d\'aide psychologique et de soutien mental dans les universités.',
    url: 'https://www.letudiant.fr/etudes/sante-mentale.html',
    category: 'Vie Étudiante',
    rubrique: 'Bien-être',
  },
  {
    title: 'Stage de Première Année : Trouver la Bonne Entreprise',
    description: 'Conseils pratiques pour décrocher un stage en première année d\'études.',
    url: 'https://www.letudiant.fr/etudes/stages.html',
    category: 'Emploi',
    rubrique: 'Stages',
  },
  {
    title: 'Frais de Scolarité : Aides Financières et Bourses 2026',
    description: 'Tour d\'horizon des aides financières pour financer vos études en 2026.',
    url: 'https://www.letudiant.fr/etudes/aides-financieres.html',
    category: 'Admission',
    rubrique: 'Finance',
  },
]

// Icon mapping by category
const CATEGORY_ICONS: Record<string, string> = {
  'Admission': '📝',
  'Formation': '📚',
  'Emploi': '💼',
  'Vie Étudiante': '🎓',
}

// Gradient distribution for visual variety
const GRADIENTS = [
  'gradient-1',
  'gradient-2',
  'gradient-3',
  'gradient-4',
  'gradient-5',
  'gradient-6',
  'gradient-7',
  'gradient-8',
  'gradient-9',
  'gradient-10',
]

// Size distribution: 60% normal, 20% large, 10% tall, 10% wide
function getRandomSize(): 'normal' | 'large' | 'tall' | 'wide' {
  const rand = Math.random()
  if (rand < 0.6) return 'normal'
  if (rand < 0.8) return 'large'
  if (rand < 0.9) return 'tall'
  return 'wide'
}

async function scrapeArticles() {
  console.log('🚀 Starting article scraper...')
  console.log(`📄 Processing ${ARTICLES.length} articles`)

  const articlesToInsert = ARTICLES.map((article) => {
    const id = randomUUID()
    const now = new Date()
    const expiresAt = new Date('2026-06-30').toISOString() // Temporary content expires June 30

    return {
      id,
      title: article.title,
      description: article.description,
      rubrique: article.rubrique,
      reading_time_minutes: Math.floor(Math.random() * 7) + 3, // 3-10 minutes
      published_at: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      external_url: article.url,
      external_source: 'letudiant',
      icon: CATEGORY_ICONS[article.category] || '📰',
      gradient_class: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
      size: getRandomSize(),
      category: article.category,
      is_featured: Math.random() < 0.2, // 20% chance to be featured
      expires_at: expiresAt,
      view_count: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }
  })

  try {
    console.log('📤 Inserting articles into Supabase...')
    const { error, data } = await supabase.from('articles').insert(articlesToInsert).select()

    if (error) {
      console.error('❌ Error inserting articles:', error)
      process.exit(1)
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} articles`)
    console.log('📋 Sample articles:')
    data?.slice(0, 3).forEach((article: any) => {
      console.log(`  - ${article.title} (${article.category})`)
    })

    console.log(`\n⏰ Expiration date: June 30, 2026`)
    console.log('🎯 All articles ready for Phase 2!')
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  }
}

scrapeArticles()
