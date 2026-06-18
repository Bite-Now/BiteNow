import api from './api';

/**
 * Fetch all active canteens.
 * 
 * @returns {Promise<any>} The list of canteens.
 * @throws Will throw an error if the request fails.
 */
export const listCanteens = async () => {
  try {
    const response = await api.get(`/canteens`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching canteens:`, error);
    throw error;
  }
};

/**
 * Fetch the complete menu for a specific canteen.
 * 
 * @param {string|number} canteenId - The ID of the canteen.
 * @returns {Promise<any>} The canteen menu data.
 * @throws Will throw an error if the request fails.
 */
export const getCanteenMenu = async (canteenId) => {
  try {
    const response = await api.get(`/canteens/${canteenId}/menu`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu for canteen ${canteenId}:`, error);
    throw error;
  }
};

/**
 * Create a new menu item for a canteen.
 * 
 * @param {string|number} canteenId - The ID of the canteen.
 * @param {Object} payload - The menu item data to create.
 * @returns {Promise<any>} The created menu item data.
 * @throws Will throw an error if the request fails.
 */
export const createMenuItem = async (canteenId, payload) => {
  try {
    const response = await api.post(`/owner/menu?canteen_id=${canteenId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error creating menu item for canteen ${canteenId}:`, error);
    throw error;
  }
};

/**
 * Update an existing menu item.
 * 
 * @param {string|number} itemId - The ID of the menu item to update.
 * @param {Object} payload - The data to update on the menu item.
 * @returns {Promise<any>} The updated menu item data.
 * @throws Will throw an error if the request fails.
 */
export const updateMenuItem = async (itemId, payload) => {
  try {
    const response = await api.patch(`/owner/menu/${itemId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating menu item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Delete a menu item.
 * 
 * @param {string|number} itemId - The ID of the menu item to delete.
 * @returns {Promise<any>} Response confirming deletion.
 * @throws Will throw an error if the request fails.
 */
export const deleteMenuItem = async (itemId) => {
  try {
    const response = await api.delete(`/owner/menu/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting menu item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Create a daily special for a canteen.
 * 
 * @param {string|number} canteenId - The ID of the canteen.
 * @param {Object} payload - The daily special data to create.
 * @returns {Promise<any>} The created daily special data.
 * @throws Will throw an error if the request fails.
 */
export const createDailySpecial = async (canteenId, payload) => {
  try {
    const response = await api.post(`/owner/specials?canteen_id=${canteenId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error creating daily special for canteen ${canteenId}:`, error);
    throw error;
  }
};

/**
 * Update an existing daily special.
 * 
 * @param {string|number} itemId - The ID of the daily special to update.
 * @param {Object} payload - The data to update on the daily special.
 * @returns {Promise<any>} The updated daily special data.
 * @throws Will throw an error if the request fails.
 */
export const updateDailySpecial = async (itemId, payload) => {
  try {
    const response = await api.patch(`/owner/specials/${itemId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating daily special ${itemId}:`, error);
    throw error;
  }
};

/**
 * Delete a daily special.
 * 
 * @param {string|number} itemId - The ID of the daily special to delete.
 * @returns {Promise<any>} Response confirming deletion.
 * @throws Will throw an error if the request fails.
 */
export const deleteDailySpecial = async (itemId) => {
  try {
    const response = await api.delete(`/owner/specials/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting daily special ${itemId}:`, error);
    throw error;
  }
};
