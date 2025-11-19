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
import { ArrowLeft, Save, Plus, X, Loader2 } from "lucide-react";
import { ProjectService, type Project, type ProjectStep, type DonationExample } from "@/src/services/project.service";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Project>>({
        title: "",
        description: "",
        short_description: "",
        category: "humanitarian",
        image_url: "",
        goal_amount: 0,
        current_amount: 0,
        status: "planning",
        steps: [],
        impact_points: [],
        donation_examples: [],
        is_featured: false,
        is_published: false,
        tags: [],
        order: 0,
    });

    const [newStep, setNewStep] = useState({ name: "", status: "pending" as "pending" | "in_progress" | "completed" });
    const [newImpactPoint, setNewImpactPoint] = useState("");
    const [newDonationExample, setNewDonationExample] = useState({ amount: 0, description: "" });
    const [newTag, setNewTag] = useState("");

    const handleSubmit1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validation de base
            if (!formData.title || !formData.description) {
                throw new Error("Le titre et la description sont obligatoires");
            }

            if ((formData?.goal_amount ?? 0) <= 0) {
                throw new Error("Le montant objectif doit être supérieur à 0");
            }

            await ProjectService.createProject(formData);
            router.push("/admin/projets");
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création du projet");
            console.error("Erreur:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validation de base
            if (!formData.title || !formData.description) {
                throw new Error("Le titre et la description sont obligatoires");
            }

            if ((formData.goal_amount ?? 0) <= 0) {
                throw new Error("Le montant objectif doit être supérieur à 0");
            }

            // Nettoyer les données avant envoi
            const cleanedData = cleanFormData(formData);

            await ProjectService.createProject(cleanedData);
            router.push("/admin/projets");
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création du projet");
            console.error("Erreur:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour nettoyer les données
    const cleanFormData = (data: Partial<Project>): Partial<Project> => {
        const cleaned = { ...data };

        // Nettoyer les chaînes de caractères
        if (cleaned.title) {
            cleaned.title = cleaned.title.replace(/&#x27;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');
        }

        if (cleaned.description) {
            cleaned.description = cleaned.description.replace(/&#x27;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');
        }

        if (cleaned.short_description) {
            cleaned.short_description = cleaned.short_description.replace(/&#x27;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&');
        }

        // Nettoyer les tableaux de texte
        if (cleaned.impact_points) {
            cleaned.impact_points = cleaned.impact_points.map(point =>
                point.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
            );
        }

        if (cleaned.tags) {
            cleaned.tags = cleaned.tags.map(tag =>
                tag.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
            );
        }

        // Nettoyer les étapes
        if (cleaned.steps) {
            cleaned.steps = cleaned.steps.map(step => ({
                ...step,
                name: step.name.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
            }));
        }

        // Nettoyer les exemples de dons
        if (cleaned.donation_examples) {
            cleaned.donation_examples = cleaned.donation_examples.map(example => ({
                ...example,
                description: example.description.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
            }));
        }

        return cleaned;
    };

    const handleChange = (field: keyof Project, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNumberChange = (field: keyof Project, value: string) => {
        const numValue = value === "" ? 0 : parseFloat(value);
        setFormData(prev => ({
            ...prev,
            [field]: numValue
        }));
    };

    // Gestion des étapes
    const addStep = () => {
        if (!newStep.name.trim()) return;

        const step: ProjectStep = {
            name: newStep.name,
            status: newStep.status,
            order: (formData.steps?.length || 0) + 1
        };

        setFormData(prev => ({
            ...prev,
            steps: [...(prev.steps || []), step]
        }));

        setNewStep({ name: "", status: "pending" });
    };

    const removeStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps?.filter((_, i) => i !== index) || []
        }));
    };

    const updateStepStatus = (index: number, status: "pending" | "in_progress" | "completed") => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps?.map((step, i) =>
                i === index ? { ...step, status } : step
            ) || []
        }));
    };

    // Gestion des points d'impact
    const addImpactPoint = () => {
        if (!newImpactPoint.trim()) return;

        setFormData(prev => ({
            ...prev,
            impact_points: [...(prev.impact_points || []), newImpactPoint.trim()]
        }));

        setNewImpactPoint("");
    };

    const removeImpactPoint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            impact_points: prev.impact_points?.filter((_, i) => i !== index) || []
        }));
    };

    // Gestion des exemples de dons
    const addDonationExample = () => {
        if (!newDonationExample.description.trim() || newDonationExample.amount <= 0) return;

        const example: DonationExample = {
            amount: newDonationExample.amount,
            description: newDonationExample.description
        };

        setFormData(prev => ({
            ...prev,
            donation_examples: [...(prev.donation_examples || []), example]
        }));

        setNewDonationExample({ amount: 0, description: "" });
    };

    const removeDonationExample = (index: number) => {
        setFormData(prev => ({
            ...prev,
            donation_examples: prev.donation_examples?.filter((_, i) => i !== index) || []
        }));
    };

    // Gestion des tags
    const addTag = () => {
        if (!newTag.trim()) return;

        setFormData(prev => ({
            ...prev,
            tags: [...(prev.tags || []), newTag.trim()]
        }));

        setNewTag("");
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter((_, i) => i !== index) || []
        }));
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: "bg-gray-100 text-gray-800",
            in_progress: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800"
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push("/admin/projects")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nouveau Projet</h1>
                        <p className="text-gray-600 mt-1">Créez un nouveau projet pour collecter des dons</p>
                    </div>
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
                        {/* Informations de base */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de base</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Titre du projet *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        placeholder="Ex: Construction d'un lieu de pèlerinage"
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
                                                <SelectItem value="construction">Construction</SelectItem>
                                                <SelectItem value="humanitarian">Humanitaire</SelectItem>
                                                <SelectItem value="education">Éducation</SelectItem>
                                                <SelectItem value="health">Santé</SelectItem>
                                                <SelectItem value="spiritual">Spirituel</SelectItem>
                                                <SelectItem value="other">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Statut du projet *</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleChange('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Statut du projet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="planning">En planification</SelectItem>
                                                <SelectItem value="in_progress">En cours</SelectItem>
                                                <SelectItem value="completed">Terminé</SelectItem>
                                                <SelectItem value="paused">En pause</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="short_description">Description courte</Label>
                                    <Textarea
                                        id="short_description"
                                        value={formData.short_description}
                                        onChange={(e) => handleChange('short_description', e.target.value)}
                                        placeholder="Une brève description qui apparaîtra dans les listes"
                                        rows={2}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Maximum 500 caractères. Actuel: {formData.short_description?.length || 0}/500
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description complète *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Décrivez en détail le projet, ses objectifs et son impact..."
                                        rows={6}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="image_url">URL de l'image</Label>
                                    <Input
                                        id="image_url"
                                        value={formData.image_url}
                                        onChange={(e) => handleChange('image_url', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        type="url"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Objectifs financiers */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Objectifs financiers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="goal_amount">Montant objectif (FCFA) *</Label>
                                        <Input
                                            id="goal_amount"
                                            type="number"
                                            value={formData.goal_amount || ""}
                                            onChange={(e) => handleNumberChange('goal_amount', e.target.value)}
                                            placeholder="5000000"
                                            min="0"
                                            step="1000"
                                            required
                                        />
                                        {(formData.goal_amount ?? 0) > 0 && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Intl.NumberFormat('fr-FR').format(formData.goal_amount ?? 0)} FCFA
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="current_amount">Montant déjà collecté (FCFA)</Label>
                                        <Input
                                            id="current_amount"
                                            type="number"
                                            value={formData.current_amount || ""}
                                            onChange={(e) => handleNumberChange('current_amount', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                </div>

                                {(formData.goal_amount ?? 0) > 0 && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Progression:</span>
                                            <span className="font-semibold">
                                                {Math.round(((formData.current_amount || 0) / (formData.goal_amount ?? 0)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, Math.round(((formData.current_amount || 0) / (formData.goal_amount ?? 0)) * 100))}%`
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            {new Intl.NumberFormat('fr-FR').format(formData.current_amount || 0)} FCFA / {new Intl.NumberFormat('fr-FR').format(formData.goal_amount ?? 0)} FCFA
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Étapes du projet */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Étapes du projet</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nom de l'étape"
                                        value={newStep.name}
                                        onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                    <Select
                                        value={newStep.status}
                                        onValueChange={(value: "pending" | "in_progress" | "completed") =>
                                            setNewStep(prev => ({ ...prev, status: value }))
                                        }
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">En attente</SelectItem>
                                            <SelectItem value="in_progress">En cours</SelectItem>
                                            <SelectItem value="completed">Terminé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" onClick={addStep}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {formData.steps && formData.steps.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.steps.map((step, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">{step.order}.</span>
                                                    <span>{step.name}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(step.status)}`}>
                                                        {step.status === 'pending' && 'En attente'}
                                                        {step.status === 'in_progress' && 'En cours'}
                                                        {step.status === 'completed' && 'Terminé'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={step.status}
                                                        onValueChange={(value: "pending" | "in_progress" | "completed") =>
                                                            updateStepStatus(index, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-28 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">En attente</SelectItem>
                                                            <SelectItem value="in_progress">En cours</SelectItem>
                                                            <SelectItem value="completed">Terminé</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeStep(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Points d'impact */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Points d'impact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ex: Construction de salles de prière"
                                        value={newImpactPoint}
                                        onChange={(e) => setNewImpactPoint(e.target.value)}
                                    />
                                    <Button type="button" onClick={addImpactPoint}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {formData.impact_points && formData.impact_points.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.impact_points.map((point, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <span>{point}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeImpactPoint(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Exemples de dons */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Exemples de dons</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Montant (FCFA)"
                                        value={newDonationExample.amount || ""}
                                        onChange={(e) => setNewDonationExample(prev => ({
                                            ...prev,
                                            amount: e.target.value ? parseInt(e.target.value) : 0
                                        }))}
                                        min="0"
                                        step="1000"
                                    />
                                    <Input
                                        placeholder="Description de l'impact"
                                        value={newDonationExample.description}
                                        onChange={(e) => setNewDonationExample(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                                <Button type="button" onClick={addDonationExample} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un exemple
                                </Button>

                                {formData.donation_examples && formData.donation_examples.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.donation_examples.map((example, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <span className="font-medium">
                                                        {new Intl.NumberFormat('fr-FR').format(example.amount)} FCFA
                                                    </span>
                                                    <span className="text-gray-600 ml-2">- {example.description}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeDonationExample(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonne latérale */}
                    <div className="space-y-6">
                        {/* Publication */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Publication</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="published">Publier le projet</Label>
                                    <Switch
                                        id="published"
                                        checked={formData.is_published}
                                        onCheckedChange={(checked) => handleChange('is_published', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="featured">Projet phare</Label>
                                    <Switch
                                        id="featured"
                                        checked={formData.is_featured}
                                        onCheckedChange={(checked) => handleChange('is_featured', checked)}
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

                                {formData.is_published && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-sm text-green-700">
                                            <strong>Publié</strong> - Ce projet sera visible par tous les visiteurs
                                        </p>
                                    </div>
                                )}

                                {formData.is_featured && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Projet phare</strong> - Ce projet sera mis en avant sur la page des dons
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nouveau tag"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                    />
                                    <Button type="button" onClick={addTag}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {formData.tags && formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm">
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(index)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Aperçu */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Aperçu du projet</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Catégorie:</span>
                                    <span className="font-medium capitalize">{formData.category}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Statut:</span>
                                    <span className="font-medium">
                                        {formData.status === 'planning' && 'En planification'}
                                        {formData.status === 'in_progress' && 'En cours'}
                                        {formData.status === 'completed' && 'Terminé'}
                                        {formData.status === 'paused' && 'En pause'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Objectif:</span>
                                    <span className="font-medium">
                                        {formData.goal_amount ? new Intl.NumberFormat('fr-FR').format(formData.goal_amount) + ' FCFA' : 'Non défini'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Étapes:</span>
                                    <span className="font-medium">{formData.steps?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Points d'impact:</span>
                                    <span className="font-medium">{formData.impact_points?.length || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Créer le projet
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}