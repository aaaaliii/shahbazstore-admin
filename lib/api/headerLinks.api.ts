import api from './api';

export interface HeaderLink {
  id?: string;
  label: string;
  href: string;
  order: number;
  openInNewTab?: boolean;
}

// Backend interface (what the API returns)
interface BackendHeaderLink {
  _id?: string;
  id?: string;
  label: string;
  url: string;
  order: number;
  isActive?: boolean;
  openInNewTab?: boolean;
}

// Transform backend response to frontend format
const transformFromBackend = (backend: BackendHeaderLink): HeaderLink => {
  return {
    id: backend._id || backend.id,
    label: backend.label,
    href: backend.url,
    order: backend.order,
    openInNewTab: backend.openInNewTab,
  };
};

// Transform frontend format to backend format
const transformToBackend = (frontend: Partial<HeaderLink>): Partial<BackendHeaderLink> => {
  const backend: Partial<BackendHeaderLink> = {};
  
  if (frontend.label !== undefined) backend.label = frontend.label;
  if (frontend.href !== undefined) backend.url = frontend.href;
  if (frontend.order !== undefined) backend.order = frontend.order;
  if (frontend.openInNewTab !== undefined) backend.openInNewTab = frontend.openInNewTab;
  
  return backend;
};

export const headerLinksApi = {
  getAll: async (): Promise<HeaderLink[]> => {
    const response = await api.get('/header-links/all');
    const links = response.data.links || [];
    return links.map(transformFromBackend);
  },

  create: async (data: Omit<HeaderLink, 'id' | 'order'>): Promise<HeaderLink> => {
    const backendData = transformToBackend(data);
    const response = await api.post('/header-links', backendData);
    return transformFromBackend(response.data.link);
  },

  update: async (id: string, data: Partial<HeaderLink>): Promise<HeaderLink> => {
    const backendData = transformToBackend(data);
    const response = await api.put(`/header-links/${id}`, backendData);
    return transformFromBackend(response.data.link);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/header-links/${id}`);
  },

  reorder: async (id: string, direction: 'up' | 'down'): Promise<HeaderLink[]> => {
    // Get current links to determine new order
    const response = await api.get('/header-links/all');
    const backendLinks = response.data.links || [];
    const currentLinks = backendLinks.map(transformFromBackend);
    
    // Find the index of the link to move
    const currentIndex = currentLinks.findIndex((link: HeaderLink) => link.id === id);
    if (currentIndex === -1) {
      throw new Error('Header link not found');
    }
    
    // Calculate new index
    let newIndex: number;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < currentLinks.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      // Already at boundary, no change needed - return current links
      return currentLinks;
    }
    
    // Create new order array by swapping
    const newOrder = [...currentLinks];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    // Send array of link IDs in new order to backend
    const linksArray = newOrder.map(link => ({ id: link.id! }));
    const reorderResponse = await api.put('/header-links/reorder', { links: linksArray });
    
    // Return the updated links from the backend
    const updatedLinks = reorderResponse.data.links || [];
    return updatedLinks.map(transformFromBackend);
  },
};
