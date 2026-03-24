import { db } from '../db.js';

/**
 * Get dashboard metrics
 * @returns {Promise<Object>} Aggregated metrics for dashboard
 */
export async function getMetrics() {
  const [
    openPositions,
    candidatesInPipeline,
    activeEmployees,
    onboardingInProgress,
    deviceTotal,
    deviceAvailable,
    deviceAssigned,
    recentActivityCount
  ] = await Promise.all([
    // Count candidates in active, non-final stages
    db.candidate.count({
      where: {
        status: 'active',
        stage: { in: ['applied', 'screening', 'interview', 'offer'] }
      }
    }),
    // Count all active candidates
    db.candidate.count({
      where: { status: 'active' }
    }),
    // Count active employees
    db.employee.count({
      where: { status: 'active' }
    }),
    // Count onboarding runs in progress
    db.onboardingRun.count({
      where: { status: 'in_progress' }
    }),
    // Total devices
    db.device.count({}),
    // Available devices
    db.device.count({
      where: { status: 'available' }
    }),
    // Assigned devices
    db.device.count({
      where: { status: 'assigned' }
    }),
    // Recent activities (last 24 hours)
    db.activity.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  return {
    openPositions,
    candidatesInPipeline,
    activeEmployees,
    onboardingInProgress,
    deviceInventory: {
      total: deviceTotal,
      available: deviceAvailable,
      assigned: deviceAssigned,
      retired: deviceTotal - deviceAvailable - deviceAssigned,
    },
    recentActivityCount,
  };
}

/**
 * Get activity feed with pagination and filters
 * @param {Object} filters - Filter and pagination options
 * @returns {Promise<Object>} Paginated activity feed
 */
export async function getActivityFeed(filters = {}) {
  const {
    type,
    employeeId,
    candidateId,
    deviceId,
    offerId,
    limit = 20,
    offset = 0,
  } = filters;

  // Build where clause
  const where = {};
  if (type) where.type = type;
  if (employeeId) where.employeeId = employeeId;
  if (candidateId) where.candidateId = candidateId;
  if (deviceId) where.deviceId = deviceId;
  if (offerId) where.offerId = offerId;

  const [activities, total] = await Promise.all([
    db.activity.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, email: true } },
        candidate: { select: { id: true, name: true, roleApplied: true } },
        device: { select: { id: true, serial: true, type: true, make: true, model: true } },
        offer: { select: { id: true, role: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.activity.count({ where }),
  ]);

  return {
    activities,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

/**
 * Create activity log entry
 * @param {Object} data - Activity data
 * @returns {Promise<Object>} Created activity
 */
export async function logActivity(data) {
  const {
    type,
    description,
    employeeId,
    candidateId,
    deviceId,
    offerId,
    metadata,
  } = data;

  if (!type || !description) {
    throw new Error('type and description are required');
  }

  return await db.activity.create({
    data: {
      type,
      description,
      employeeId: employeeId || null,
      candidateId: candidateId || null,
      deviceId: deviceId || null,
      offerId: offerId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
    include: {
      employee: { select: { id: true, name: true, email: true } },
      candidate: { select: { id: true, name: true, roleApplied: true } },
      device: { select: { id: true, serial: true, type: true, make: true, model: true } },
      offer: { select: { id: true, role: true, status: true } },
    },
  });
}

/**
 * Get candidate stage distribution widget data
 * @returns {Promise<Array>} Stage counts
 */
export async function getCandidateStageWidget() {
  const stages = await db.candidate.groupBy({
    by: ['stage'],
    where: { status: 'active' },
    _count: true,
  });

  return stages.map(s => ({
    stage: s.stage,
    count: s._count,
    percentage: 0, // Will be calculated by frontend
  }));
}

/**
 * Get onboarding progress widget data
 * @returns {Promise<Object>} Onboarding stats
 */
export async function getOnboardingProgressWidget() {
  const [inProgress, complete, pending] = await Promise.all([
    db.onboardingRun.count({ where: { status: 'in_progress' } }),
    db.onboardingRun.count({ where: { status: 'complete' } }),
    db.onboardingRun.count({ where: { status: 'pending' } }),
  ]);

  return {
    inProgress,
    complete,
    pending,
    total: inProgress + complete + pending,
  };
}

/**
 * Get device inventory widget data
 * @returns {Promise<Object>} Device inventory stats
 */
export async function getDeviceInventoryWidget() {
  const byStatus = await db.device.groupBy({
    by: ['status'],
    _count: true,
  });

  const byType = await db.device.groupBy({
    by: ['type'],
    _count: true,
  });

  const statusMap = {};
  byStatus.forEach(item => {
    statusMap[item.status] = item._count;
  });

  const typeMap = {};
  byType.forEach(item => {
    typeMap[item.type] = item._count;
  });

  const total = byStatus.reduce((sum, item) => sum + item._count, 0);

  return {
    total,
    byStatus: statusMap,
    byType: typeMap,
    available: statusMap.available || 0,
    assigned: statusMap.assigned || 0,
    retired: statusMap.retired || 0,
  };
}

/**
 * Get team activity widget data
 * @returns {Promise<Object>} Recent team actions
 */
export async function getTeamActivityWidget() {
  const recentActions = await db.activity.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    include: {
      employee: { select: { id: true, name: true } },
      candidate: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const typeCount = await db.activity.groupBy({
    by: ['type'],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    _count: true,
  });

  const typeMap = {};
  typeCount.forEach(item => {
    typeMap[item.type] = item._count;
  });

  return {
    recentActions,
    activityByType: typeMap,
    totalActivities: recentActions.length,
  };
}

export default {
  getMetrics,
  getActivityFeed,
  logActivity,
  getCandidateStageWidget,
  getOnboardingProgressWidget,
  getDeviceInventoryWidget,
  getTeamActivityWidget,
};
