export interface EvidenceItem {
  category: string
  description: string
  is_positive: boolean
  confidence_weight: number
}

export interface CandidateMatch {
  id: number
  pin_code: string
  post_office_name: string
  office_type: string
  delivery_status: string
  locality: string
  district: string
  state: string
  division?: string | null
  circle?: string | null
  latitude?: number | null
  longitude?: number | null
  has_verified_coords: boolean
  raw_match_score: number
  calibrated_confidence: number
  confidence_level: 'high' | 'medium' | 'low' | 'none'
  evidence: EvidenceItem[]
  dataset_version: string
}

export interface ClarificationOption {
  id: string
  label: string
  description?: string | null
  pin_code?: string | null
  candidate_id?: number | null
}

export interface ClarificationQuestion {
  attribute: string
  question: string
  options: ClarificationOption[]
  reason: string
}

export interface ExtractedEntities {
  locality?: string | null
  city_or_town?: string | null
  district?: string | null
  state?: string | null
  pin_code?: string | null
  landmarks: string[]
  corrections_applied: Record<string, string>
}

export interface PredictionResponse {
  status: 'matched' | 'ambiguous' | 'unmatched'
  query_original: string
  query_normalized: string
  extracted_entities: ExtractedEntities
  primary_match?: CandidateMatch | null
  alternatives: CandidateMatch[]
  clarification?: ClarificationQuestion | null
  overall_confidence: number
  confidence_level: 'high' | 'medium' | 'low' | 'none'
  warnings: string[]
  model_version: string
  dataset_version: string
  ranking_mode: string
  latency_ms: number
}

export interface PostOffice {
  id: number
  pin_code: string
  post_office_name: string
  office_type: string
  delivery_status: string
  locality: string
  district: string
  state: string
  division?: string | null
  region?: string | null
  circle?: string | null
  taluk?: string | null
  telephone?: string | null
  related_suboffice?: string | null
  related_headoffice?: string | null
  latitude?: number | null
  longitude?: number | null
  has_verified_coords: boolean
  dataset_version?: string
}

export interface PostOfficeListResponse {
  items: PostOffice[]
  total: number
  page: number
  size: number
  total_pages: number
}

export interface SearchHistoryItem {
  id: number
  session_id: string
  query_text: string
  query_type: string
  predicted_pin?: string | null
  predicted_post_office?: string | null
  confidence: number
  status: string
  match_evidence?: EvidenceItem[]
  created_at?: string
}

export interface BatchRecordResult {
  row_index: number
  original_address: string
  normalized_address: string
  predicted_pin?: string | null
  post_office_name?: string | null
  district?: string | null
  state?: string | null
  confidence: number
  confidence_level: string
  status: 'matched' | 'ambiguous' | 'unmatched' | 'error'
  suggested_alternative?: string | null
  review_required: boolean
  notes?: string | null
}

export interface BatchJobStatus {
  job_id: string
  filename: string
  total_records: number
  processed_records: number
  matched_count: number
  ambiguous_count: number
  unmatched_count: number
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string | null
  results: BatchRecordResult[]
}

export interface FeedbackReport {
  id: number
  query_text: string
  predicted_pin?: string | null
  predicted_post_office?: string | null
  suggested_pin?: string | null
  suggested_post_office?: string | null
  user_comment?: string | null
  status: string
  created_at: string
}

export interface ModelMetric {
  model_name: string
  top1_accuracy: number
  top3_accuracy: number
  macro_f1: number
  mean_latency_ms: number
  test_sample_size: number
  is_active: boolean
}

export interface AnalyticsResponse {
  total_queries: number
  matched_queries: number
  ambiguous_queries: number
  unmatched_queries: number
  match_rate_percentage: number
  avg_confidence_score: number
  confidence_distribution: Record<string, number>
  dataset_stats: {
    source?: string
    import_date?: string | null
    last_successful_update?: string | null
    number_of_records_imported?: number
    rejected_rows?: number
    total_post_offices: number
    total_pin_codes: number
    total_districts: number
    total_states: number
    total_aliases: number
    dataset_version: string
    has_verified_coords_count: number
  }
  model_evaluations: ModelMetric[]
  recent_feedback_count: number
}

export interface NetworkDot {
  district: string
  state: string
  latitude: number
  longitude: number
  count: number
}
