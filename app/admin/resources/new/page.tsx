"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save } from "lucide-react";
import { ResourceService, type Resource } from "@/src/services/resource.service";

export default function NewResourcePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ResourceService.createResource(formData);
      router.push("/admin/resources");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la ressource");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/resources")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Ressource</h1>
          <p className="text-gray-600 mt-1">Ajouter une nouvelle ressource à la bibliothèque</p>
        </div>
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
                    ? "La ressource sera visible publiquement" 
                    : "La ressource sera enregistrée comme brouillon"
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Création..." : "Créer la ressource"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}