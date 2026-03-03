import HeaderLinksClient from "./HeaderLinksClient";
import { serverApiWithAuth } from "../../../lib/api/server.api";

// Transform backend response to frontend format
const transformFromBackend = (backend: any) => {
  return {
    id: backend._id || backend.id,
    label: backend.label,
    href: backend.url,
    order: backend.order,
  };
};

export default async function HeaderLinksPage() {
  try {
    const backendLinks = await serverApiWithAuth.headerLinks.getAll();
    
    // Transform backend format to frontend format
    const links = backendLinks.map(transformFromBackend);
    
    console.log('Header links fetched:', links);

    return (
      <HeaderLinksClient
        initialLinks={links || []}
      />
    );
  } catch (error: any) {
    console.error('Error fetching header links:', error);
    console.error('Error details:', error.message);
    // Fallback to empty data on error
    return (
      <HeaderLinksClient
        initialLinks={[]}
      />
    );
  }
}
