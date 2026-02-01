/**
 * Department Configuration
 * Maps Confluence spaces to room layouts and visual themes
 */

export const DEPARTMENTS = [
  // Floor 2 (Top)
  { code: 'Eng', name: 'Engineering', floor: 2, position: 0, color: '#3498db' },
  { code: 'QA', name: 'Quality Assurance', floor: 2, position: 1, color: '#e74c3c' },
  { code: 'ADS', name: 'Advertising', floor: 2, position: 2, color: '#f39c12' },
  { code: 'EP', name: 'Eng Platform', floor: 2, position: 3, color: '#9b59b6' },
  { code: 'PM', name: 'Product Management', floor: 2, position: 4, color: '#1abc9c' },
  
  // Floor 1 (Bottom)
  { code: 'Ops', name: 'Operations', floor: 1, position: 0, color: '#34495e' },
  { code: 'DW', name: 'Data Warehouse', floor: 1, position: 1, color: '#16a085' },
  { code: 'IT', name: 'IT Support', floor: 1, position: 2, color: '#7f8c8d' },
  { code: 'MKT', name: 'Marketing', floor: 1, position: 3, color: '#e67e22' },
  { code: 'OM', name: 'Office Management', floor: 1, position: 4, color: '#95a5a6' }
];

export const DEPARTMENT_THEMES = {
  'Eng': {
    props: ['code-editor', 'terminal', 'git-branch'],
    screens: 'code-lines',
    keywords: ['design', 'api', 'implementation', 'backend']
  },
  'QA': {
    props: ['bug-tracker', 'test-cases', 'device-emulators'],
    screens: 'test-dashboard',
    keywords: ['test', 'bug', 'rejection', 'war room']
  },
  'PM': {
    props: ['wireframes', 'user-journeys', 'analytics'],
    screens: 'product-roadmap',
    keywords: ['prd', 'design', 'spec', 'requirements']
  },
  'ADS': {
    props: ['revenue-graphs', 'ab-tests', 'ad-performance'],
    screens: 'ad-metrics',
    keywords: ['adlib', 'version', 'release', 'configuration']
  },
  'MKT': {
    props: ['campaign-calendar', 'social-feeds', 'content-drafts'],
    screens: 'marketing-dashboard',
    keywords: ['campaign', 'survey', 'seo', 'metrics']
  },
  'IT': {
    props: ['server-racks', 'ticket-queue', 'monitoring'],
    screens: 'system-status',
    keywords: ['mdm', 'migration', 'helpdesk', 'support']
  },
  'Ops': {
    props: ['deployment-pipeline', 'incident-dashboard', 'alerts'],
    screens: 'operations-board',
    keywords: ['deployment', 'incident', 'release', 'production']
  },
  'EP': {
    props: ['infrastructure', 'ci-cd', 'kubernetes'],
    screens: 'platform-metrics',
    keywords: ['platform', 'infrastructure', 'devops']
  },
  'DW': {
    props: ['data-pipelines', 'sql-queries', 'etl'],
    screens: 'data-dashboard',
    keywords: ['data', 'warehouse', 'analytics', 'pipeline']
  },
  'OM': {
    props: ['calendars', 'documents', 'facilities'],
    screens: 'admin-tools',
    keywords: ['office', 'admin', 'facilities', 'management']
  }
};

// Room layout configuration
export const ROOM_LAYOUT = {
  width: 384,   // pixels per room
  height: 216,  // pixels per room
  floors: [
    { y: 0, departments: ['Eng', 'QA', 'ADS', 'EP', 'PM'] },    // Floor 2
    { y: 216, departments: ['Ops', 'DW', 'IT', 'MKT', 'OM'] }   // Floor 1
  ]
};

// Canvas size: 1920x432 (5 rooms * 384 width, 2 floors * 216 height)
export const CANVAS_CONFIG = {
  width: 1920,
  height: 432,
  backgroundColor: 0x1a1a2e
};

// Polling intervals configuration
export const POLL_INTERVALS = {
  HIGH_ACTIVITY: {
    spaces: ['Eng', 'QA', 'EP'],
    interval: 30000  // 30 seconds
  },
  MEDIUM_ACTIVITY: {
    spaces: ['PM', 'ADS', 'Ops'],
    interval: 60000  // 60 seconds
  },
  LOW_ACTIVITY: {
    spaces: ['DW', 'IT', 'MKT', 'OM'],
    interval: 120000  // 2 minutes
  }
};
