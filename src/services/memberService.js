/**
 * CareGuard AI – Member Service
 *
 * Provides member-specific fetch functions and mock CSV-backed data.
 * This module is intentionally isolated so components can remain unchanged
 * when the backend migrates from CSV to REST API.
 */

import Papa from 'papaparse';
import { adaptMembers } from '../adapters/memberAdapter.js';

let cachedMembers = null;
let isLoading = false;
let loadPromise = null;

/**
 * Loads the 50k member dataset via PapaParse.
 * Uses a promise to prevent concurrent fetches during React strict mode.
 */
function loadInitialMemberRows() {
  if (cachedMembers) {
    return Promise.resolve(cachedMembers);
  }

  if (isLoading) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    Papa.parse('/data/member_risk_stratification_50k_clean.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const adapted = adaptMembers(results.data);
          cachedMembers = adapted;
          resolve(adapted);
        } catch (err) {
          reject(err);
        } finally {
          isLoading = false;
        }
      },
      error: (error) => {
        isLoading = false;
        reject(error);
      }
    });
  });

  return loadPromise;
}

/**
 * Fetches and normalizes member data.
 * @returns {Promise<Object[]>}
 */
export async function fetchMembers() {
  return await loadInitialMemberRows();
}

/**
 * Fetches a single member by ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchMemberById(id) {
  const members = await fetchMembers();
  return members.find((member) => member.id === id) || null;
}

/**
 * Fetches summary statistics from the current member set.
 * Calculates risk distribution and specific target probabilities.
 * @returns {Promise<Object>}
 */
export async function fetchDashboardStats() {
  const members = await fetchMembers();
  
  // Calculate distribution for 5 tiers
  const tierDistribution = {
    'Very Low': 0,
    'Low': 0,
    'Moderate': 0,
    'High': 0,
    'Very High': 0
  };

  let hospitalization30dCount = 0;
  let hospitalization60dCount = 0;
  let hospitalization90dCount = 0;

  members.forEach((member) => {
    const tier = member.risk.tier;
    if (tierDistribution[tier] !== undefined) {
      tierDistribution[tier]++;
    }

    if (member.targets.hospitalization30d === 1) hospitalization30dCount++;
    if (member.targets.hospitalization60d === 1) hospitalization60dCount++;
    if (member.targets.hospitalization90d === 1) hospitalization90dCount++;
  });

  return {
    totalMembers: members.length,
    tierDistribution,
    hospitalization30dCount,
    hospitalization60dCount,
    hospitalization90dCount,
  };
}

