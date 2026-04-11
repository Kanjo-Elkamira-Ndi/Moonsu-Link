import { getCropPricesByCrop, getCropPrices } from './cropPriceService';
import { getCropByName } from './cropService';
import { t } from '../config/templates';
import type { Lang } from '../config/templates';

export const pricesService = {
  async lookup({ crop, lang }: { crop: string; lang: Lang }): Promise<string> {
    try {
      // First, find the crop by name
      const cropData = await getCropByName(crop);
      if (!cropData) {
        return t(lang, 'price_not_found', { crop });
      }

      // Get prices for this crop
      const prices = await getCropPricesByCrop(cropData.id);

      if (prices.length === 0) {
        return t(lang, 'price_not_found', { crop });
      }

      // Group by region
      const byRegion: Record<string, typeof prices> = {};
      prices.forEach(price => {
        if (!byRegion[price.region]) byRegion[price.region] = [];
        byRegion[price.region].push(price);
      });

      // Format the response
      let response = t(lang, 'price_header', { crop: cropData.name });

      Object.entries(byRegion).forEach(([region, regionPrices]) => {
        response += `\n\n*${region}:*`;
        regionPrices.forEach(price => {
          response += `\n${price.min_price}-${price.max_price} FCFA/kg`;
        });
      });

      return response;
    } catch (error) {
      console.error('Error in pricesService.lookup:', error);
      return t(lang, 'error_generic');
    }
  },
};