"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Mic,
  FileText,
  Heart,
  DollarSign,
  Users,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
// Importez vos services réels
import { EventService } from "@/src/services/event.service";
import { SermonService } from "@/src/services/sermon.service";
import { BlogPostService } from "@/src/services/blog.service";
import { PrayerRequestService } from "@/src/services/prayer.service";
// import { DonationService } from "@/src/services/donation.service"
// import { VolunteerService } from "@/src/services/volunteer.service"

interface DashboardStats {
  name: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utilisez vos services réels ici
      const [
        eventsCount,
        sermonsCount,
        blogCount,
        prayersCount,
        totalDonations,
        volunteersCount,
      ] = await Promise.all([
        EventService.getAllEvents(),
        SermonService.getAllSermonsCount(),
        BlogPostService.getAllBlogPosts(),
        PrayerRequestService.getAllPrayerRequests(),
        // DonationService.getTotalDonations(),
        // VolunteerService.getVolunteersCount()

        // En attendant, valeurs simulées
        Promise.resolve(12),
        Promise.resolve(8),
        Promise.resolve(24),
        Promise.resolve(45),
        Promise.resolve(12500.75),
        Promise.resolve(32),
      ]);

      const dashboardStats: DashboardStats[] = [
        {
          name: "Événements",
          value: eventsCount.length,
          icon: Calendar,
          color: "text-blue-600",
          bg: "bg-blue-100",
        },
        {
          name: "Sermons",
          value: sermonsCount,
          icon: Mic,
          color: "text-purple-600",
          bg: "bg-purple-100",
        },
        {
          name: "Articles de blog",
          value: blogCount.data.length,
          icon: FileText,
          color: "text-green-600",
          bg: "bg-green-100",
        },
        {
          name: "Demandes de prière",
          value: prayersCount.data.length,
          icon: Heart,
          color: "text-red-600",
          bg: "bg-red-100",
        },
        {
          name: "Dons totaux",
          value: `$${
            typeof totalDonations === "number"
              ? totalDonations.toFixed(2)
              : "0.00"
          }`,
          icon: DollarSign,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
        },
        {
          name: "Bénévoles",
          value: volunteersCount,
          icon: Users,
          color: "text-indigo-600",
          bg: "bg-indigo-100",
        },
      ];

      setStats(dashboardStats);
    } catch (err: any) {
      console.error("Erreur chargement dashboard:", err.message);
      setError("Impossible de charger les données du dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Le reste du composant reste identique...
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={fetchDashboardData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }
  function DashboardSkeleton() {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue dans votre tableau de bord de gestion d'église
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.name}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Gardez le même composant DashboardSkeleton...
