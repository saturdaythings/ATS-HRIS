import express from 'express';

const router = express.Router();

const VALID_THEMES = ['light', 'dark'];
const VALID_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo'
];
const VALID_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja'];

let workspaceSettings = {
  companyName: 'V.Two Operations',
  logoUrl: '/logo.png',
  theme: 'light',
  timezone: 'America/New_York',
  language: 'en',
  maxUsers: 50
};

// GET /api/admin/settings - Get workspace settings
router.get('/', (req, res) => {
  try {
    res.json({ data: workspaceSettings, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/settings - Update workspace settings
router.patch('/', (req, res) => {
  try {
    const { companyName, logoUrl, theme, timezone, language, maxUsers } = req.body;

    // Validate theme
    if (theme && !VALID_THEMES.includes(theme)) {
      return res.status(400).json({
        error: `Invalid theme. Must be one of: ${VALID_THEMES.join(', ')}`
      });
    }

    // Validate timezone
    if (timezone && !VALID_TIMEZONES.includes(timezone)) {
      return res.status(400).json({
        error: `Invalid timezone. Must be one of: ${VALID_TIMEZONES.join(', ')}`
      });
    }

    // Validate language
    if (language && !VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(', ')}`
      });
    }

    // Update settings
    if (companyName !== undefined) workspaceSettings.companyName = companyName;
    if (logoUrl !== undefined) workspaceSettings.logoUrl = logoUrl;
    if (theme !== undefined) workspaceSettings.theme = theme;
    if (timezone !== undefined) workspaceSettings.timezone = timezone;
    if (language !== undefined) workspaceSettings.language = language;
    if (maxUsers !== undefined) workspaceSettings.maxUsers = maxUsers;

    res.json({ data: workspaceSettings, error: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
