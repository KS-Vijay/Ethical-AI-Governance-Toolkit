import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yqqqjizgrzxzrcgprwci.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcXFqaXpncnp4enJjZ3Byd2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDg3MTQsImV4cCI6MjA2OTIyNDcxNH0.Re5MLxAd89BH6MAkG9dbjC-AslJBz6YBDjUxsGJy87U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface FairsightReport {
  id: string
  user_id: string
  session_id: string
  model_name: string
  ethical_score: number
  bias_score: number
  fairness_score: number
  grade: string
  detailed_reasoning: {
    metric_explanations: Record<string, string>
    flaw_analysis: string[]
    recommendations: string[]
    statistical_evidence: Record<string, any>
  }
  bias_results: any[]
  fairness_results: Record<string, any>
  flaws_analysis: Record<string, any>
  recommendations: Record<string, any>
  statistical_evidence: Record<string, any>
  pdf_url?: string
  created_at: string
}

export interface RegistryMetadata {
  id: string
  report_id: string
  file_path: string
  file_size: number
  created_at: string
} 