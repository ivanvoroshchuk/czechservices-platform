export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'FREE',
    label: 'Zdarma',
    pricePerMonth: 0,
    maxPhotos: 3,
    maxVideos: 0,
    maxServices: 1,
    features: ['1 служба', '3 фото', 'Базовий профіль'],
  },
  BASIC: {
    name: 'BASIC',
    label: 'Základní',
    pricePerMonth: 49900, // 499 CZK in cents
    maxPhotos: 10,
    maxVideos: 2,
    maxServices: 5,
    features: ['5 послуг', '10 фото', '2 відео', 'Пріоритет у пошуку'],
  },
  PREMIUM: {
    name: 'PREMIUM',
    label: 'Prémiový',
    pricePerMonth: 99900, // 999 CZK in cents
    maxPhotos: 30,
    maxVideos: 5,
    maxServices: 15,
    features: ['15 послуг', '30 фото', '5 відео', 'Виділений профіль', 'Аналітика'],
  },
  PRO: {
    name: 'PRO',
    label: 'Profesionální',
    pricePerMonth: 199900, // 1999 CZK in cents
    maxPhotos: 100,
    maxVideos: 20,
    maxServices: 50,
    features: ['50 послуг', '100 фото', '20 відео', 'Топ позиція', 'Пріоритетна підтримка', 'API доступ'],
  },
};
