/**
 * State Analyzer
 * Determines room states based on Confluence/Jira activity
 */

import { KEYWORD_TRIGGERS, ACTIVITY_THRESHOLDS, ROOM_STATES } from '../../shared/state-definitions.js';

/**
 * Analyze Confluence activity to determine state signals
 */
export function analyzeConfluenceActivity(confluenceData) {
  const { pages, updates, keywords } = confluenceData;
  
  // Priority 1: Check for critical keywords
  for (const keyword of KEYWORD_TRIGGERS.BLOCKED) {
    if (keywords.some(k => k.toLowerCase().includes(keyword))) {
      return { state: ROOM_STATES.BLOCKED, priority: 1, source: 'confluence' };
    }
  }
  
  // Priority 2: Check for shipping keywords
  for (const keyword of KEYWORD_TRIGGERS.SHIPPING) {
    if (keywords.some(k => k.toLowerCase().includes(keyword))) {
      return { state: ROOM_STATES.SHIPPING, priority: 2, source: 'confluence' };
    }
  }
  
  // Priority 3: Check activity volume for crunch mode
  if (updates >= ACTIVITY_THRESHOLDS.UPDATES_PER_WEEK.CRUNCH) {
    return { state: ROOM_STATES.CRUNCH, priority: 3, source: 'confluence' };
  }
  
  // Priority 4: Check for planning keywords
  for (const keyword of KEYWORD_TRIGGERS.PLANNING) {
    if (keywords.some(k => k.toLowerCase().includes(keyword))) {
      return { state: ROOM_STATES.PLANNING, priority: 4, source: 'confluence' };
    }
  }
  
  // Priority 5: Active state based on updates
  if (updates >= ACTIVITY_THRESHOLDS.UPDATES_PER_WEEK.ACTIVE) {
    return { state: ROOM_STATES.ACTIVE, priority: 5, source: 'confluence' };
  }
  
  // Priority 6: Idle state
  if (updates >= ACTIVITY_THRESHOLDS.UPDATES_PER_WEEK.IDLE) {
    return { state: ROOM_STATES.IDLE, priority: 6, source: 'confluence' };
  }
  
  // Priority 7: Off-hours (no activity)
  return { state: ROOM_STATES.OFF_HOURS, priority: 7, source: 'confluence' };
}

/**
 * Analyze Jira activity to determine state signals
 */
export function analyzeJiraActivity(jiraData) {
  const { issuesBlocked, issuesDoneToday, highPriorityCount, issuesInProgress } = jiraData;
  
  // Priority 1: Blocked issues
  if (issuesBlocked >= ACTIVITY_THRESHOLDS.JIRA_ISSUES.BLOCKED) {
    return { state: ROOM_STATES.BLOCKED, priority: 1, source: 'jira' };
  }
  
  // Priority 2: Shipping (many completions)
  if (issuesDoneToday >= ACTIVITY_THRESHOLDS.JIRA_ISSUES.SHIPPING_DONE_TODAY) {
    return { state: ROOM_STATES.SHIPPING, priority: 2, source: 'jira' };
  }
  
  // Priority 3: Crunch mode (high priority + active work)
  if (highPriorityCount >= ACTIVITY_THRESHOLDS.JIRA_ISSUES.HIGH_PRIORITY_CRUNCH && 
      issuesInProgress >= ACTIVITY_THRESHOLDS.JIRA_ISSUES.IN_PROGRESS_ACTIVE) {
    return { state: ROOM_STATES.CRUNCH, priority: 3, source: 'jira' };
  }
  
  // Priority 5: Active (work in progress)
  if (issuesInProgress >= ACTIVITY_THRESHOLDS.JIRA_ISSUES.IN_PROGRESS_ACTIVE) {
    return { state: ROOM_STATES.ACTIVE, priority: 5, source: 'jira' };
  }
  
  // Default: Idle
  return { state: ROOM_STATES.IDLE, priority: 6, source: 'jira' };
}

/**
 * Combine Confluence and Jira signals to determine final room state
 */
export function determineRoomState(confluenceData, jiraData) {
  const confluenceState = analyzeConfluenceActivity(confluenceData);
  const jiraState = analyzeJiraActivity(jiraData);
  
  // Blocked always wins (lowest priority number = highest importance)
  if (confluenceState.state === ROOM_STATES.BLOCKED || jiraState.state === ROOM_STATES.BLOCKED) {
    return {
      state: ROOM_STATES.BLOCKED,
      metadata: {
        confluenceUpdates: confluenceData.updates,
        jiraBlocked: jiraData.issuesBlocked,
        source: 'both'
      }
    };
  }
  
  // Shipping second priority
  if (confluenceState.state === ROOM_STATES.SHIPPING || jiraState.state === ROOM_STATES.SHIPPING) {
    return {
      state: ROOM_STATES.SHIPPING,
      metadata: {
        confluenceUpdates: confluenceData.updates,
        jiraDoneToday: jiraData.issuesDoneToday,
        source: confluenceState.state === ROOM_STATES.SHIPPING ? 'confluence' : 'jira'
      }
    };
  }
  
  // Use whichever state has higher priority (lower number)
  const finalState = confluenceState.priority < jiraState.priority ? confluenceState : jiraState;
  
  return {
    state: finalState.state,
    metadata: {
      confluenceUpdates: confluenceData.updates,
      jiraInProgress: jiraData.issuesInProgress,
      jiraHighPriority: jiraData.highPriorityCount,
      source: finalState.source
    }
  };
}

/**
 * Calculate character count based on state and activity volume
 */
export function calculateCharacterCount(state, activityMetrics) {
  const baseCount = {
    [ROOM_STATES.BLOCKED]: 4,
    [ROOM_STATES.SHIPPING]: 6,
    [ROOM_STATES.CRUNCH]: 8,
    [ROOM_STATES.ACTIVE]: 5,
    [ROOM_STATES.PLANNING]: 4,
    [ROOM_STATES.IDLE]: 1,
    [ROOM_STATES.OFF_HOURS]: 0
  };
  
  // Scale based on activity volume (up to 1.5x)
  const volumeMultiplier = Math.min(
    activityMetrics.confluenceUpdates / 10,
    1.5
  );
  
  return Math.round(baseCount[state] * Math.max(volumeMultiplier, 1));
}
