import { Area } from './area.model';
import { Market } from './market.model';
import { Region } from './region.model';
import { Store } from './store.model';

/**
 * Organizational resource types.
 */
export type resourceType = 'company' | 'region' | 'market' | 'area' | 'store';

/**
 * Determines how to load the resource via the active flag when either active (`ACTIVE`), in-active (`INACTIVE`), or both (`ALL`).
 */
export type activeFilter = 'ACTIVE' | 'ALL' | 'INACTIVE';

/**
 * Organizational resource type for the resource and its parent mapping.
 */
export type childResource = Region | Market | Area | Store;
