// src/services/event.service.ts
import apiClient from "@/lib/apiCaller";

export interface Event {
  _id?: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string | null;
  max_attendees: number | null;
}

export const EventService = {
  // 🟢 Récupérer tous les événements
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await apiClient.get<Event[]>("/events/get");
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des événements :",
        error.message
      );
      throw error;
    }
  },

  // 🟣 Récupérer un événement par ID
  async getEventById(id: string): Promise<Event> {
    try {
      const response =  await apiClient.get<Event>(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors du chargement de l'événement ${id} :`,
        error.message
      );
      throw error;
    }
  },

  // 🟡 Créer un nouvel événement
  async createEvent(data: Event | FormData): Promise<Event> {
    try {
      console.log("Event : ", data);
      const response =  await apiClient.post<Event>("/events/create", data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Erreur lors de la création de l'événement :",
        error.message
      );
      throw error;
    }
  },

  // 🟠 Mettre à jour un événement
  async updateEvent(id: string, data: Event | FormData): Promise<Event> {
    try {
      const response =  await apiClient.put<Event>(`/events/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors de la mise à jour de l'événement ${id} :`,
        error.message
      );
      throw error;
    }
  },

  // 🔴 Supprimer un événement
  async deleteEvent(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `Erreur lors de la suppression de l'événement ${id} :`,
        error.message
      );
      throw error;
    }
  },
};
