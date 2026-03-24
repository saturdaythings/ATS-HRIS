/**
 * Export Service Tests
 * Tests for CSV generation and data export functionality
 * Unit tests using mocks for data layer
 */

import * as exportService from '../../services/exportService.js';

describe('Export Service - arrayToCSV', () => {
  describe('arrayToCSV', () => {
    it('should convert array of objects to CSV string', () => {
      const data = [
        { Name: 'John Doe', Email: 'john@example.com', Role: 'Engineer' },
        { Name: 'Jane Smith', Email: 'jane@example.com', Role: 'Designer' },
      ];

      const csv = exportService.arrayToCSV(data);

      expect(csv).toContain('"Name","Email","Role"');
      expect(csv).toContain('"John Doe","john@example.com","Engineer"');
      expect(csv).toContain('"Jane Smith","jane@example.com","Designer"');
    });

    it('should escape quotes in CSV values', () => {
      const data = [
        { Name: 'John "The Great" Doe', Email: 'john@example.com' },
      ];

      const csv = exportService.arrayToCSV(data);

      expect(csv).toContain('"John ""The Great"" Doe"');
    });

    it('should handle empty data', () => {
      const csv = exportService.arrayToCSV([]);
      expect(csv).toBe('');
    });

    it('should handle null and undefined values', () => {
      const data = [
        { Name: 'John', Email: null, Role: undefined },
      ];

      const csv = exportService.arrayToCSV(data);

      expect(csv).toContain('"John",,');
    });

    it('should handle special characters', () => {
      const data = [
        { Name: 'John, Doe', Email: 'john@example.com\nline2' },
      ];

      const csv = exportService.arrayToCSV(data);

      expect(csv).toContain('"John, Doe"');
    });
  });
});
