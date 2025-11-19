"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import { ResourceService, type Resource } from "@/src/services/resource.service";
import Link from "next/link";

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Resource>>({
    title: "",
    description: "",
    category: "book",
    file_type: "pdf",
    file_url: "",
    file_size: 0,
    pages: undefined,
    duration: "",
    artist: "",
    tags: [],
    is_published: false,
    order: 0,
  });

  const resourceId = params.id as string;

  // Charger la ressource existante
  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const resource = await ResourceService.getResourceById(resourceId);
        setFormData({
          title: resource.title,
          description: resource.description,
          category: resource.category,
          file_type: resource.file_type,
          file_url: resource.file_url || "",
          file_size: resource.file_size || 0,
          pages: resource.pages,
          duration: resource.duration || "",
          artist: resource.artist || "",
          tags: resource.tags || [],
          is_published: resource.is_published,
          order: resource.order,
        });
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de la ressource");
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await ResourceService.updateResource(resourceId, formData);
      router.push("/admin/resources");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de la ressource");
      console.error("Erreur:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Resource, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleFileSizeChange = (value: string) => {
    const sizeInBytes = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      file_size: sizeInBytes
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Chargement de la ressource...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/resources")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier la ressource</h1>
            <p className="text-gray-600 mt-1">Modifier les informations de la ressource</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/resources/${resourceId}`}>
            <Eye className="mr-2 h-4 w-4" />
            Voir la ressource
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Titre de la ressource"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description de la ressource"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book">Livre</SelectItem>
                        <SelectItem value="brochure">Brochure</SelectItem>
                        <SelectItem value="song">Chant</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file_type">Type de fichier *</Label>
                    <Select 
                      value={formData.file_type} 
                      onValueChange={(value) => handleChange('file_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type de fichier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                        <SelectItem value="text">Texte</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="none">Aucun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="file_url">URL du fichier</Label>
                    <Input
                      id="file_url"
                      value={formData.file_url}
                      onChange={(e) => handleChange('file_url', e.target.value)}
                      placeholder="https://example.com/fichier.pdf"
                      type="url"
                    />
                  </div>

                  <div>
                    <Label htmlFor="file_size">Taille du fichier (en bytes)</Label>
                    <Input
                      id="file_size"
                      type="number"
                      value={formData.file_size || ""}
                      onChange={(e) => handleFileSizeChange(e.target.value)}
                      placeholder="1048576"
                      min="0"
                    />
                    {formData.file_size && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(formData.file_size)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pages">Nombre de pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      value={formData.pages || ""}
                      onChange={(e) => handleChange('pages', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Durée (HH:MM:SS)</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleChange('duration', e.target.value)}
                      placeholder="00:30:00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="order">Ordre d'affichage</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleChange('order', parseInt(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="artist">Artiste/Prédicateur</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => handleChange('artist', e.target.value)}
                    placeholder="Nom de l'artiste ou du prédicateur"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(', ') || ""}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="bible, prière, foi, ..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Séparez les tags par des virgules
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Statut de publication</Label>
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => handleChange('is_published', checked)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {formData.is_published 
                    ? "La ressource est visible publiquement" 
                    : "La ressource est enregistrée comme brouillon"
                  }
                </p>

                {formData.is_published && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <strong>Publié</strong> - Cette ressource est visible par tous les visiteurs
                    </p>
                  </div>
                )}

                {!formData.is_published && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Brouillon</strong> - Cette ressource n'est visible que par les administrateurs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Téléchargements</span>
                  <span className="font-semibold">
                    {/* Note: Vous devrez récupérer cette info depuis la ressource complète */}
                    {formData.download_count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dernière modification</span>
                  <span className="text-sm text-gray-500">Maintenant</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder les modifications
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push("/admin/resources")}
                >
                  Annuler
                </Button>

                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <Link href={`/admin/resources/${resourceId}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir la ressource
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Aperçu des changements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aperçu des changements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catégorie:</span>
                    <span className="font-medium capitalize">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type de fichier:</span>
                    <span className="font-medium">{formData.file_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className={`font-medium ${formData.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                      {formData.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

// Fonction utilitaire pour formater la taille du fichier
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}