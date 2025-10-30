"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SermonService, type Sermon } from "@/src/services/sermon.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner"; // ou useToast selon votre setup

interface SermonFormProps {
  sermon?: Sermon;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SermonForm({ sermon, onSuccess, onCancel }: SermonFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: sermon?.title || "",
    description: sermon?.description || "",
    pastor_name: sermon?.pastor_name || "",
    sermon_date: sermon?.sermon_date
      ? new Date(sermon.sermon_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    scripture_reference: sermon?.scripture_reference || "",
    video_url: sermon?.video_url || "",
    audio_url: sermon?.audio_url || "",
    transcript: sermon?.transcript || "",
    series: sermon?.series || "",
    tags: sermon?.tags?.join(", ") || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Préparer les données pour l'API
      const sermonData = {
        title: formData.title,
        description: formData.description || null,
        pastor_name: formData.pastor_name,
        sermon_date: formData.sermon_date,
        scripture_reference: formData.scripture_reference || null,
        video_url: formData.video_url || null,
        audio_url: formData.audio_url || null,
        transcript: formData.transcript || null,
        series: formData.series || null,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      if (sermon?._id) {
        // Mettre à jour le sermon existant
        await SermonService.updateSermon(sermon._id, sermonData);
        toast.success("Sermon mis à jour avec succès");
      } else {
        // Créer un nouveau sermon
        await SermonService.createSermon(sermonData);
        toast.success("Sermon créé avec succès");
      }

      // Gérer le succès
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/sermons");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Erreur lors de la sauvegarde:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Une erreur est survenue lors de la sauvegarde";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // Validation des champs requis
  const isFormValid =
    formData.title.trim() !== "" &&
    formData.pastor_name.trim() !== "" &&
    formData.sermon_date.trim() !== "";

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* En-tête */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {sermon ? "Modifier le sermon" : "Nouveau sermon"}
            </h2>
            {sermon && (
              <div className="text-sm text-muted-foreground">
                ID: {sermon._id}
              </div>
            )}
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations de base</h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Titre du sermon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  placeholder="Entrez le titre du sermon"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pastor_name">
                  Nom du pasteur <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pastor_name"
                  required
                  value={formData.pastor_name}
                  onChange={handleInputChange("pastor_name")}
                  placeholder="Entrez le nom du pasteur"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange("description")}
                placeholder="Description du sermon..."
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sermon_date">
                  Date du sermon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sermon_date"
                  type="date"
                  required
                  value={formData.sermon_date}
                  onChange={handleInputChange("sermon_date")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scripture_reference">Référence biblique</Label>
                <Input
                  id="scripture_reference"
                  placeholder="ex: Jean 3:16-17"
                  value={formData.scripture_reference}
                  onChange={handleInputChange("scripture_reference")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Catégorisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Catégorisation</h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="series">Série</Label>
                <Input
                  id="series"
                  placeholder="ex: Série sur la foi"
                  value={formData.series}
                  onChange={handleInputChange("series")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  placeholder="ex: foi, prière, adoration"
                  value={formData.tags}
                  onChange={handleInputChange("tags")}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Séparez les tags par des virgules
                </p>
              </div>
            </div>
          </div>

          {/* Médias */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Médias</h3>

            <div className="space-y-2">
              <Label htmlFor="video_url">URL de la vidéo</Label>
              <Input
                id="video_url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={handleInputChange("video_url")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio_url">URL de l'audio</Label>
              <Input
                id="audio_url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={formData.audio_url}
                onChange={handleInputChange("audio_url")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transcript">Transcription</Label>
              <Textarea
                id="transcript"
                rows={6}
                placeholder="Entrez la transcription complète du sermon ici..."
                value={formData.transcript}
                onChange={handleInputChange("transcript")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="min-w-32"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {sermon ? "Mise à jour..." : "Création..."}
                </>
              ) : sermon ? (
                "Mettre à jour"
              ) : (
                "Créer le sermon"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>

          {/* Indicateur de validation */}
          {!isFormValid && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-600">
                ⚠️ Veuillez remplir tous les champs obligatoires (titre,
                pasteur, date)
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
