export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    phone: string | null
                    role: 'customer' | 'worker' | 'admin'
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    phone?: string | null
                    role?: 'customer' | 'worker' | 'admin'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    phone?: string | null
                    role?: 'customer' | 'worker' | 'admin'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            salons: {
                Row: {
                    id: string
                    name: string
                    address: string
                    city: string
                    state: string | null
                    zip_code: string | null
                    phone: string | null
                    description: string | null
                    image_url: string | null
                    latitude: number | null
                    longitude: number | null
                    opening_time: string | null
                    closing_time: string | null
                    is_active: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    address: string
                    city: string
                    state?: string | null
                    zip_code?: string | null
                    phone?: string | null
                    description?: string | null
                    image_url?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    opening_time?: string | null
                    closing_time?: string | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    address?: string
                    city?: string
                    state?: string | null
                    zip_code?: string | null
                    phone?: string | null
                    description?: string | null
                    image_url?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    opening_time?: string | null
                    closing_time?: string | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    salon_id: string | null
                    name: string
                    description: string | null
                    duration_minutes: number
                    price: number
                    category: 'haircut' | 'styling' | 'coloring' | 'treatment' | 'other' | null
                    image_url: string | null
                    is_active: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    salon_id?: string | null
                    name: string
                    description?: string | null
                    duration_minutes?: number
                    price: number
                    category?: 'haircut' | 'styling' | 'coloring' | 'treatment' | 'other' | null
                    image_url?: string | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    salon_id?: string | null
                    name?: string
                    description?: string | null
                    duration_minutes?: number
                    price?: number
                    category?: 'haircut' | 'styling' | 'coloring' | 'treatment' | 'other' | null
                    image_url?: string | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            workers: {
                Row: {
                    id: string
                    profile_id: string | null
                    salon_id: string | null
                    specialization: string | null
                    bio: string | null
                    rating: number | null
                    total_reviews: number | null
                    is_available: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id?: string | null
                    salon_id?: string | null
                    specialization?: string | null
                    bio?: string | null
                    rating?: number | null
                    total_reviews?: number | null
                    is_available?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string | null
                    salon_id?: string | null
                    specialization?: string | null
                    bio?: string | null
                    rating?: number | null
                    total_reviews?: number | null
                    is_available?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    customer_id: string | null
                    worker_id: string | null
                    salon_id: string | null
                    service_id: string | null
                    appointment_date: string
                    start_time: string
                    end_time: string
                    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | null
                    notes: string | null
                    total_price: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    customer_id?: string | null
                    worker_id?: string | null
                    salon_id?: string | null
                    service_id?: string | null
                    appointment_date: string
                    start_time: string
                    end_time: string
                    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | null
                    notes?: string | null
                    total_price?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    customer_id?: string | null
                    worker_id?: string | null
                    salon_id?: string | null
                    service_id?: string | null
                    appointment_date?: string
                    start_time?: string
                    end_time?: string
                    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | null
                    notes?: string | null
                    total_price?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            reviews: {
                Row: {
                    id: string
                    appointment_id: string | null
                    customer_id: string | null
                    worker_id: string | null
                    rating: number
                    comment: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    appointment_id?: string | null
                    customer_id?: string | null
                    worker_id?: string | null
                    rating: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    appointment_id?: string | null
                    customer_id?: string | null
                    worker_id?: string | null
                    rating?: number
                    comment?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
