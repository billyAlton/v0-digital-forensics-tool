"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Heart, Calendar, User, Search, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrayerRequestService, type PrayerRequest } from "@/src/services/prayer.service";

export default function PrayersPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [filteredPrayers, setFilteredPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [privacyFilter, setPrivacyFilter] = useState("all");

  // Charger les prières
  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async () => {
    try {
      setLoading(true);
      const data = await PrayerRequestService.getAllPrayerRequests();
      setPrayers(data.data || []);
      setFilteredPrayers(data.data || []);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des prières");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let result = prayers;

    // Filtre de recherche
    if (searchTerm) {
      result = result.filter(
        (prayer) =>
          prayer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prayer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (prayer.requester_name && 
           prayer.requester_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      result = result.filter((prayer) => prayer.status === statusFilter);
    }

    // Filtre par confidentialité
    if (privacyFilter !== "all") {
      if (privacyFilter === "public") {
        result = result.filter((prayer) => prayer.is_public);
      } else if (privacyFilter === "private") {
        result = result.filter((prayer) => !prayer.is_public);
      }
    }

    setFilteredPrayers(result);
  }, [prayers, searchTerm, statusFilter, privacyFilter]);

  // Récupérer les statuts uniques pour le filtre
  const uniqueStatuses = [...new Set(prayers.map((p) => p.status))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des prières...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={loadPrayers}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demandes de Prière</h1>
          <p className="text-gray-600 mt-2">
            {filteredPrayers.length} demande{filteredPrayers.length !== 1 ? "s" : ""} de prière
            {filteredPrayers.length !== 1 ? "s" : ""} trouvée{filteredPrayers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPrayers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button asChild>
            <Link href="/admin/prayers/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une demande
            </Link>
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par confidentialité */}
            <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les visibilités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les visibilités</SelectItem>
                <SelectItem value="public">Publiques</SelectItem>
                <SelectItem value="private">Privées</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton reset filtres */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPrivacyFilter("all");
              }}
              disabled={!searchTerm && statusFilter === "all" && privacyFilter === "all"}
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prières */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredPrayers.map((prayer) => (
          <PrayerCard key={prayer._id} prayer={prayer} onUpdate={loadPrayers} />
        ))}
      </div>

      {/* État vide avec filtres actifs */}
      {filteredPrayers.length === 0 && prayers.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Aucune demande de prière ne correspond à vos critères de recherche
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPrivacyFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* État vide sans données */}
      {prayers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune demande de prière pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter votre première demande de prière
            </p>
            <Button asChild>
              <Link href="/admin/prayers/new">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une demande
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant PrayerCard séparé
interface PrayerCardProps {
  prayer: PrayerRequest;
  onUpdate: () => void;
}

function PrayerCard({ prayer, onUpdate }: PrayerCardProps) {
  const [isPraying, setIsPraying] = useState(false);

  const handlePray = async () => {
    try {
      setIsPraying(true);
      // Appel à votre service pour incrémenter le compteur
      await PrayerRequestService.incrementPrayerCount(prayer._id);
      onUpdate(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de l'ajout de la prière:", error);
    } finally {
      setIsPraying(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "answered":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{prayer.title}</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              {prayer.is_anonymous ? (
                <span className="italic">Anonyme</span>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>{prayer.requester_name}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={getStatusVariant(prayer.status)}>
            {prayer.status}
          </Badge>
        </div>

        <p className="text-gray-700 line-clamp-3 mb-4">{prayer.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePray}
                disabled={isPraying}
                className="h-8 px-2"
              >
                <Heart className={`h-4 w-4 ${isPraying ? "animate-pulse" : "text-red-500"}`} />
                <span className="ml-1">{prayer.prayer_count} prières</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(prayer.createdAt), "dd/MM/yyyy")}</span>
            </div>
            {!prayer.is_public && <Badge variant="outline">Privée</Badge>}
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/prayers/${prayer._id}`}>Voir</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/admin/prayers/${prayer._id}/edit`}>Modifier</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}