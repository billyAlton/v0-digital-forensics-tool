// src/hooks/useTestimonies.ts
import { useState, useEffect } from 'react';
import { TestimonyService, Testimony, TestimoniesResponse } from '@/src/services/testimony.service';

interface UseTestimoniesProps {
  category?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
  autoFetch?: boolean;
}

export const useTestimonies = (props: UseTestimoniesProps = {}) => {
  const { category, featured, limit = 10, page = 1, autoFetch = true } = props;
  
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchTestimonies = async (overrideParams?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        category,
        featured,
        limit,
        page,
        ...overrideParams
      };

      const response: TestimoniesResponse = await TestimonyService.getApprovedTestimonies(params);
      
      setTestimonies(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erreur récupération témoignages:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des témoignages');
      setTestimonies([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTestimonies();
  };

  const loadMore = async () => {
    if (pagination.page >= pagination.pages) return;
    
    try {
      const nextPage = pagination.page + 1;
      const response: TestimoniesResponse = await TestimonyService.getApprovedTestimonies({
        category,
        featured,
        limit,
        page: nextPage
      });
      
      setTestimonies(prev => [...prev, ...response.data]);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Erreur chargement supplémentaire:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement supplémentaire');
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTestimonies();
    }
  }, [category, featured, limit, page, autoFetch]);

  return {
    testimonies,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    hasMore: pagination.page < pagination.pages
  };
};

// Hook pour les statistiques admin
export const useTestimonyStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await TestimonyService.getTestimonyStats();
      setStats(response);
    } catch (err: any) {
      console.error('Erreur récupération stats:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};