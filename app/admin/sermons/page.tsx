"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  Mic,
  Calendar,
  Eye,
  Video,
  Music,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { DeleteSermonButton } from "@/components/delete-sermon-button";
import { SermonService, type Sermon } from "@/src/services/sermon.service";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [pastorFilter, setPastorFilter] = useState("all");

  // Charger les sermons
  useEffect(() => {
    loadSermons();
  }, []);

  const loadSermons = async () => {
    try {
      setLoading(true);
      const data = await SermonService.getAllSermons();
      setSermons(data);
      setFilteredSermons(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des sermons");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let result = sermons;

    // Filtre de recherche
    if (searchTerm) {
      result = result.filter(
        (sermon) =>
          sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sermon.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sermon.pastor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sermon.series?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par série
    if (seriesFilter !== "all") {
      result = result.filter((sermon) => sermon.series === seriesFilter);
    }

    // Filtre par pasteur
    if (pastorFilter !== "all") {
      result = result.filter((sermon) => sermon.pastor_name === pastorFilter);
    }

    setFilteredSermons(result);
  }, [sermons, searchTerm, seriesFilter, pastorFilter]);

  // Récupérer les séries uniques pour le filtre
  const uniqueSeries = [
    ...new Set(sermons.map((s) => s.series).filter(Boolean)),
  ] as string[];
  const uniquePastors = [...new Set(sermons.map((s) => s.pastor_name))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des sermons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={loadSermons}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sermons</h1>
          <p className="text-gray-600 mt-2">
            {filteredSermons.length} sermon
            {filteredSermons.length !== 1 ? "s" : ""} trouvé
            {filteredSermons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sermons/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un sermon
          </Link>
        </Button>
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

            {/* Filtre par série */}
            <Select value={seriesFilter} onValueChange={setSeriesFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les séries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les séries</SelectItem>
                {uniqueSeries.map((series) => (
                  <SelectItem key={series} value={series}>
                    {series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par pasteur */}
            <Select value={pastorFilter} onValueChange={setPastorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les pasteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pasteurs</SelectItem>
                {uniquePastors.map((pastor) => (
                  <SelectItem key={pastor} value={pastor}>
                    {pastor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bouton reset filtres */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSeriesFilter("all");
                setPastorFilter("all");
              }}
              disabled={
                !searchTerm && seriesFilter === "all" && pastorFilter === "all"
              }
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des sermons */}
      <div className="grid gap-6">
        {filteredSermons.map((sermon) => (
          <SermonCard key={sermon._id} sermon={sermon} onDelete={loadSermons} />
        ))}
      </div>

      {/* État vide */}
      {filteredSermons.length === 0 && sermons.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun sermon trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Aucun sermon ne correspond à vos critères de recherche
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSeriesFilter("all");
                setPastorFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {sermons.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mic className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun sermon pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter votre premier sermon
            </p>
            <Button asChild>
              <Link href="/admin/sermons/new">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un sermon
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant SermonCard séparé pour une meilleure organisation
interface SermonCardProps {
  sermon: Sermon;
  onDelete: () => void;
}

function SermonCard({ sermon, onDelete }: SermonCardProps) {
  return (
    <Card key={sermon._id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
              <Mic className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {sermon.title}
                </h3>
                <p className="text-gray-600 mt-1">par {sermon.pastor_name}</p>
                {sermon.series && (
                  <Badge className="mt-2" variant="secondary">
                    {sermon.series}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/sermons/${sermon._id}`}>Voir</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/sermons/${sermon._id}/edit`}>
                    Modifier
                  </Link>
                </Button>
                <DeleteSermonButton
                  sermonId={sermon._id!}
                  size="sm"
                  onSuccess={onDelete}
                />
              </div>
            </div>
            <p className="mt-3 text-gray-700 line-clamp-2">
              {sermon.description}
            </p>

            {/* Tags */}
            {sermon.tags && sermon.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {sermon.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(sermon.sermon_date), "dd/MM/yyyy")}
              </div>
              {sermon.scripture_reference && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Écriture:</span>
                  {sermon.scripture_reference}
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              {sermon.video_url && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Vidéo
                </Badge>
              )}
              {sermon.audio_url && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  Audio
                </Badge>
              )}
              {sermon.transcript && (
                <Badge variant="outline">Transcription</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
