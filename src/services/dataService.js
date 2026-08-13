import { fetchMembers as fetchMembersFromMemberService, fetchMemberById as fetchMemberByIdFromMemberService, fetchDashboardStats as fetchDashboardStatsFromMemberService } from './memberService.js';

/**
 * CareGuard AI - Legacy Data Service Compatibility Wrapper
 *
 * Existing app code can continue importing from dataService.js,
 * while the implementation remains in memberService.js.
 */

export async function fetchMembers() {
  return fetchMembersFromMemberService();
}

export async function fetchMemberById(id) {
  return fetchMemberByIdFromMemberService(id);
}

export async function fetchDashboardStats() {
  return fetchDashboardStatsFromMemberService();
}
