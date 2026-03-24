import { db } from '../db.js';
import { hashPassword } from '../middleware/auth.js';

// Users
export async function listUsers() {
  return db.user.findMany({ select: { id: true, name: true, email: true, role: true, active: true, createdAt: true } });
}

export async function inviteUser(email, role) {
  const tempPassword = 'temppass123'; // User will reset on first login
  const hashedPassword = await hashPassword(tempPassword);
  return db.user.create({ data: { name: email, email, password: hashedPassword, role } });
}

export async function updateUserRole(userId, role) {
  return db.user.update({ where: { id: userId }, data: { role } });
}

export async function deleteUser(userId) {
  return db.user.update({ where: { id: userId }, data: { active: false } });
}

// ConfigLists
export async function listLists() {
  return db.configList.findMany({ include: { items: { orderBy: { order: 'asc' } } } });
}

export async function listItems(listId) {
  return db.configListItem.findMany({ where: { listId }, orderBy: { order: 'asc' } });
}

export async function createItem(listId, label, value, order) {
  const itemValue = value || label;
  return db.configListItem.create({ data: { listId, label, value: itemValue, order: order || 0 } });
}

export async function updateItem(itemId, label, value, order) {
  return db.configListItem.update({ where: { id: itemId }, data: { label, value, order } });
}

export async function deleteItem(itemId) {
  return db.configListItem.delete({ where: { id: itemId } });
}
