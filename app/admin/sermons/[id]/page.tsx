"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Edit,
  Eye,
  Video,
  Music,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { DeleteSermonButton } from "@/components/delete-sermon-button";
import { SermonService, type Sermon } from "@/src/services/sermon.service";
import { toast } from "sonner";
import { fr } from 'date-fns/locale'

// Utilisation
export default function SermonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le sermon
  useEffect(() => {
    loadSermon();
  }, [id]);

  

  const loadSermon = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SermonService.getSermonById(id);
      setSermon(data.data);
    } catch (err: any) {
      console.error("Erreur chargement sermon:", err);
      setError(err.message || "Erreur lors du chargement du sermon");
      toast.error("Erreur lors du chargement du sermon");
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteSuccess = () => {
    toast.success("Sermon supprimé avec succès");
    router.push("/admin/sermons");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
          <p className="mt-2 text-gray-600">Chargement du sermon...</p>
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Sermon non trouvé"}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadSermon}>Réessayer</Button>
            <Button variant="outline" asChild>
              <Link href="/admin/sermons">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux sermons
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête avec navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/sermons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux sermons
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{sermon.title}</h1>
          <p className="text-gray-600 mt-2">par {sermon.pastor_name}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {sermon.series && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {sermon.series}
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {sermon.createdAt}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/sermons/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <DeleteSermonButton sermonId={id} onSuccess={handleDeleteSuccess} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails du sermon */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du sermon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sermon.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {sermon.description}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Date</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    {sermon.createdAt}
                  </div>
                </div>
                {sermon.scripture_reference && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Référence biblique
                    </h3>
                    <p className="text-gray-700 font-medium">
                      {sermon.scripture_reference}
                    </p>
                  </div>
                )}
              </div>

              {sermon.tags && sermon.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {sermon.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vidéo */}
          {sermon.video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Vidéo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Button asChild>
                    <a
                      href={sermon.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Ouvrir la vidéo
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Lien externe: {new URL(sermon.video_url).hostname}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Audio */}
          {sermon.audio_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    Fichier audio disponible
                  </span>
                  <Button asChild variant="outline">
                    <a
                      href={sermon.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Music className="mr-2 h-4 w-4" />
                      Écouter
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transcription */}
          {sermon.transcript && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {sermon.transcript}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Vues</span>
                </div>
                {/* <span className="text-2xl font-bold text-gray-900">
                  {sermon.views || 0}
                </span> */}
              </div>

              {/* Ajoutez d'autres statistiques si disponibles */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Créé le:{" "}
                  {sermon.createdAt
                    ? format(new Date(sermon.createdAt), "dd/MM/yyyy")
                    : "N/A"}
                </p>
                {sermon.updatedAt &&
                  sermon.updatedAt !== sermon.createdAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Modifié le:{" "}
                      {format(new Date(sermon.updatedAt), "dd/MM/yyyy")}
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Fichiers médias */}
          <Card>
            <CardHeader>
              <CardTitle>Fichiers médias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Vidéo</span>
                </div>
                <Badge variant={sermon.video_url ? "default" : "secondary"}>
                  {sermon.video_url ? "Disponible" : "Non disponible"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Audio</span>
                </div>
                <Badge variant={sermon.audio_url ? "default" : "secondary"}>
                  {sermon.audio_url ? "Disponible" : "Non disponible"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Transcription</span>
                </div>
                <Badge variant={sermon.transcript ? "default" : "secondary"}>
                  {sermon.transcript ? "Disponible" : "Non ajoutée"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/admin/sermons/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier le sermon
                </Link>
              </Button>

              {sermon.video_url && (
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={sermon.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Voir la vidéo
                  </a>
                </Button>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/sermons">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la liste
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
