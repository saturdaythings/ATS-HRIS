import { db } from '../db.js';

/**
 * Offer Service
 * Handles CRUD operations for job offers
 */

/**
 * Create a new offer
 * @param {Object} data - Offer data
 * @param {string} data.candidateId - Candidate ID (required)
 * @param {string} data.role - Job role (required)
 * @param {string} data.compensation - Compensation details (optional)
 * @param {string} data.startDate - Start date (optional)
 * @param {string} data.sentAt - Sent date (optional)
 * @param {string} data.expiresAt - Expiration date (optional)
 * @param {string} data.notes - Notes (optional)
 * @returns {Promise<Object>} Created offer
 */
export async function createOffer(data) {
  const {
    candidateId,
    role,
    compensation = null,
    startDate = null,
    sentAt = null,
    expiresAt = null,
    notes = null,
  } = data;

  // Validate required fields
  if (!candidateId) throw new Error('candidateId is required');
  if (!role) throw new Error('role is required');

  // Verify candidate exists
  const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Create offer
  const offer = await db.offer.create({
    data: {
      candidateId,
      role,
      compensation,
      startDate: startDate ? new Date(startDate) : null,
      sentAt: sentAt ? new Date(sentAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notes,
      status: 'pending',
    },
  });

  return offer;
}

/**
 * Get offer by ID
 * @param {string} id - Offer ID
 * @returns {Promise<Object>} Offer
 */
export async function getOffer(id) {
  const offer = await db.offer.findUnique({ where: { id } });

  if (!offer) {
    throw new Error('Offer not found');
  }

  return offer;
}

/**
 * Update offer
 * @param {string} id - Offer ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated offer
 */
export async function updateOffer(id, data) {
  // Verify offer exists
  const existing = await db.offer.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Offer not found');
  }

  // Build update object, converting string dates to Date objects
  const updateData = {};
  for (const key of Object.keys(data)) {
    if (key === 'startDate' || key === 'sentAt' || key === 'expiresAt') {
      updateData[key] = data[key] ? new Date(data[key]) : null;
    } else {
      updateData[key] = data[key];
    }
  }

  // Update offer
  const updated = await db.offer.update({
    where: { id },
    data: updateData,
  });

  return updated;
}

/**
 * List offers for a candidate
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Array>} List of offers
 */
export async function listOffers(candidateId) {
  // Verify candidate exists
  const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const offers = await db.offer.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
  });

  return offers;
}

/**
 * Delete offer
 * @param {string} id - Offer ID
 * @returns {Promise<void>}
 */
export async function deleteOffer(id) {
  // Verify offer exists
  const existing = await db.offer.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Offer not found');
  }

  await db.offer.delete({ where: { id } });
}
