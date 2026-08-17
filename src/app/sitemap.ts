import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Menggunakan nama domain terbaru kamu
  const baseUrl = 'https://hotwheels-stock-idn.vercel.app';

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/my-bookings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
