"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, CheckCircle, Clock, Archive, X, TrendingUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { TestimonyService, TestimonyStats } from "@/src/services/testimony.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestimonyStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<TestimonyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await TestimonyService.getTestimonyStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <StatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
        <p className="text-gray-600 mb-6">{error || "Impossible de charger les statistiques"}</p>
        <Button onClick={() => router.push("/admin/testimonies")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux témoignages
        </Button>
      </div>
    );
  }

  const statusCounts = {
    pending: stats.byStatus.find(s => s._id === 'pending')?.count || 0,
    approved: stats.byStatus.find(s => s._id === 'approved')?.count || 0,
    scheduled: stats.byStatus.find(s => s._id === 'scheduled')?.count || 0,
    archived: stats.byStatus.find(s => s._id === 'archived')?.count || 0,
    rejected: stats.byStatus.find(s => s._id === 'rejected')?.count || 0
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/testimonies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistiques des témoignages</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble des témoignages de la communauté</p>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Témoignages soumis</p>
          </CardContent>
        </Card>

        {/* En attente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground">En attente de modération</p>
          </CardContent>
        </Card>

        {/* Approuvés */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.approved}</div>
            <p className="text-xs text-muted-foreground">Témoignages publiés</p>
          </CardContent>
        </Card>

        {/* Mis en avant */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis en avant</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">Témoignages spéciaux</p>
          </CardContent>
        </Card>
      </div>

      {/* Détails par statut */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="capitalize font-medium">{status}</span>
                </div>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusIcon(status: string) {
  const icons = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    approved: <CheckCircle className="h-4 w-4 text-green-500" />,
    scheduled: <Calendar className="h-4 w-4 text-blue-500" />,
    archived: <Archive className="h-4 w-4 text-gray-500" />,
    rejected: <X className="h-4 w-4 text-red-500" />
  };
  return icons[status as keyof typeof icons] || <Users className="h-4 w-4" />;
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton En-tête */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-24" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* Skeleton Cartes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skeleton Répartition */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}