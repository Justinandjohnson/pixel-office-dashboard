/**
 * Room State Definitions
 * Maps activity patterns to visual states
 */

export const ROOM_STATES = {
  BLOCKED: 'blocked',
  SHIPPING: 'shipping',
  CRUNCH: 'crunch',
  ACTIVE: 'active',
  PLANNING: 'planning',
  IDLE: 'idle',
  OFF_HOURS: 'off-hours'
};

export const KEYWORD_TRIGGERS = {
  BLOCKED: ['war room', 'rejection', 'incident', 'blocked', 'critical issue'],
  SHIPPING: ['release', 'deployment', 'shipped', 'launched', 'published'],
  PLANNING: ['prd', 'design', 'spec', 'planning', 'retrospective'],
  CRUNCH: ['urgent', 'asap', 'emergency', 'hotfix', 'critical']
};

export const STATE_VISUALS = {
  blocked: {
    lighting: { color: 0xFF0000, intensity: 0.8, pulsing: true },
    characterCount: 4,
    characterBehavior: 'standing-frustrated',
    animation: 'red-alert-pulse',
    speed: 'slow'
  },
  shipping: {
    lighting: { color: 0xFFFFFF, intensity: 1.0, pulsing: false },
    characterCount: 6,
    characterBehavior: 'celebrating',
    animation: 'confetti-burst',
    speed: 'normal'
  },
  crunch: {
    lighting: { color: 0xFFFFFF, intensity: 0.9, pulsing: false },
    characterCount: 8,
    characterBehavior: 'fast-typing',
    animation: 'speed-lines',
    speed: 'fast'
  },
  active: {
    lighting: { color: 0xF0F0E8, intensity: 0.7, pulsing: false },
    characterCount: 5,
    characterBehavior: 'typing',
    animation: 'steady-work',
    speed: 'normal'
  },
  planning: {
    lighting: { color: 0xFFF8E8, intensity: 0.6, pulsing: false },
    characterCount: 4,
    characterBehavior: 'whiteboard-meeting',
    animation: 'collaborative',
    speed: 'slow'
  },
  idle: {
    lighting: { color: 0xE8E8E8, intensity: 0.4, pulsing: false },
    characterCount: 1,
    characterBehavior: 'relaxed-sitting',
    animation: 'minimal',
    speed: 'slow'
  },
  'off-hours': {
    lighting: { color: 0x202040, intensity: 0.1, pulsing: false },
    characterCount: 0,
    characterBehavior: null,
    animation: 'lights-off',
    speed: 'none'
  }
};

// Activity thresholds for state determination
export const ACTIVITY_THRESHOLDS = {
  UPDATES_PER_WEEK: {
    CRUNCH: 15,
    ACTIVE: 5,
    IDLE: 1
  },
  JIRA_ISSUES: {
    BLOCKED: 2,
    SHIPPING_DONE_TODAY: 5,
    HIGH_PRIORITY_CRUNCH: 5,
    IN_PROGRESS_ACTIVE: 3
  },
  TIME: {
    HOURS_SINCE_UPDATE_IDLE: 2,
    WORK_HOURS_START: 8,
    WORK_HOURS_END: 18
  }
};

// Polling intervals by priority tier
export const POLL_INTERVALS = {
  HIGH_ACTIVITY: {
    spaces: ['Eng', 'QA', 'PM'],
    interval: 30000,  // 30 seconds
    priority: 1
  },
  MEDIUM_ACTIVITY: {
    spaces: ['ADS', 'MKT', 'IT'],
    interval: 60000,  // 60 seconds
    priority: 2
  },
  LOW_ACTIVITY: {
    spaces: ['Ops', 'EP', 'DW', 'OM'],
    interval: 120000, // 2 minutes
    priority: 3
  }
};
