import { VerticalRegistry } from '../types';
import { cleaningVertical } from './cleaning.vertical';
import { landscapeVertical } from './landscape.vertical';
import { hvacVertical } from './hvac.vertical';

/**
 * Global registry of all vertical configurations
 */
import { vendingVertical } from './vending.vertical';

export const verticalRegistry: VerticalRegistry = {
  verticals: {
    cleaning: cleaningVertical,
    vending: vendingVertical,
    landscape: landscapeVertical,
    hvac: hvacVertical,
  },

  hostnameMappings: [
    // Cleaning vertical
    { hostname: 'vendingexits.com', verticalSlug: 'vending', isPrimary: true },
    { hostname: 'www.vendingexits.com', verticalSlug: 'vending', isPrimary: false },
    { hostname: 'localhost', verticalSlug: 'vending', isPrimary: false }, // Development

    // Landscape vertical
    { hostname: 'landscapeexits.com', verticalSlug: 'landscape', isPrimary: true },
    { hostname: 'www.landscapeexits.com', verticalSlug: 'landscape', isPrimary: false },

    // HVAC vertical
    { hostname: 'hvacexits.com', verticalSlug: 'hvac', isPrimary: true },
    { hostname: 'www.hvacexits.com', verticalSlug: 'hvac', isPrimary: false },
  ],

  defaultVertical: 'vending',
};
