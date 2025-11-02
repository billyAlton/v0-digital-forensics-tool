"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Edit, Heart, User } from "lucide-react";
import { DeletePrayerRequestButton } from "@/components/delete-prayer-request-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PrayerRequestService,
  type PrayerRequest,
} from "@/src/services/prayer.service";

export default function PrayerRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadPrayerRequest = async () => {
      try {
        setLoading(true);
        const { id } = await params;
        const prayerData = await PrayerRequestService.getPrayerRequestById(id);
        setPrayer(prayerData);
      } catch (err: any) {
        console.error("Erreur chargement demande:", err.message);
        setError("Impossible de charger la demande de prière");
      } finally {
        setLoading(false);
      }
    };

    loadPrayerRequest();
  }, [params]);

  if (loading) {
    return <PrayerDetailSkeleton />;
  }

  if (error || !prayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Demande non trouvée
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "La demande de prière n'existe pas"}
        </p>
        <Button asChild>
          <Link href="/admin/prayers">Retour aux demandes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{prayer.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge
              variant={
                prayer.status === "active"
                  ? "default"
                  : prayer.status === "answered"
                  ? "secondary"
                  : "outline"
              }
            >
              {prayer.status}
            </Badge>
            {!prayer.is_public && <Badge variant="outline">Privée</Badge>}
            {prayer.is_anonymous && <Badge variant="outline">Anonyme</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/prayers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/prayers/${prayer._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <DeletePrayerRequestButton
            prayerId={prayer._id}
            prayerTitle={prayer.title}
            onDelete={() => router.push("/admin/prayers")}
          />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la demande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {prayer.description}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Demandeur
                  </h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    {prayer.is_anonymous ? (
                      <span className="italic">Anonyme</span>
                    ) : (
                      <span>{prayer.requester_name}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Soumis le
                  </h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(prayer.createdAt), "PPP")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Historique des prières ({prayer.interactions?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {prayer.interactions && prayer.interactions.length > 0 ? (
                <div className="space-y-3">
                  {prayer.interactions.map((interaction) => (
                    <div key={interaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium">
                          {interaction.user?.first_name} {interaction.user?.last_name}
                        </span>
                        <span className="text-sm text-gray-600">a prié</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {format(new Date(interaction.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">Personne n'a encore prié</p>
              )}
            </CardContent>
          </Card> */}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-600">
                    Total des prières
                  </span>
                </div>
                <span className="text-2xl font-bold">
                  {prayer.prayer_count}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Visibilité</span>
                <Badge variant={prayer.is_public ? "default" : "secondary"}>
                  {prayer.is_public ? "Publique" : "Privée"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Anonyme</span>
                <Badge variant={prayer.is_anonymous ? "default" : "secondary"}>
                  {prayer.is_anonymous ? "Oui" : "Non"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Composant Skeleton pour le chargement
function PrayerDetailSkeleton() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mx-auto" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
