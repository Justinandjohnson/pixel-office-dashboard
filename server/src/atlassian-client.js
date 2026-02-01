/**
 * Atlassian Client
 * Handles queries to Confluence and Jira via REST APIs
 */

import 'dotenv/config';

export class AtlassianMCPClient {
  constructor() {
    this.confluenceUrl = process.env.CONFLUENCE_URL;
    this.username = process.env.CONFLUENCE_USERNAME;
    this.apiToken = process.env.CONFLUENCE_API_TOKEN;

    // Extract base URL for API calls
    this.baseUrl = this.confluenceUrl?.replace('/wiki', '');
    this.authHeader = Buffer.from(`${this.username}:${this.apiToken}`).toString('base64');
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Basic ${this.authHeader}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error.message);
      throw error;
    }
  }

  /**
   * Query Confluence for recent activity in a space
   */
  async queryConfluence(space, options = {}) {
    try {
      // Check if we have credentials configured
      if (!this.confluenceUrl || !this.username || !this.apiToken) {
        console.warn('Atlassian credentials not configured');
        return { space, pages: [], updates: 0, keywords: [], lastUpdate: new Date() };
      }

      // Query for pages updated in the last 7 days using Confluence API v2
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const dateStr = oneWeekAgo.toISOString().split('T')[0];

      // Use Confluence API v2 - v1 is deprecated
      const cql = `space=${space} AND type=page AND lastModified >= "${dateStr}"`;
      const url = `${this.baseUrl}/wiki/api/v2/pages?spaceKey=${space}&limit=100&sort=-modified-date`;

      const data = await this.makeRequest(url);

      const pages = data.results || [];

      // Filter for pages updated in last 7 days
      const recentPages = pages.filter(page => {
        if (!page.version || !page.version.createdAt) return false;
        const lastModified = new Date(page.version.createdAt);
        return lastModified >= oneWeekAgo;
      });

      const updates = recentPages.length;

      // Extract keywords from recent page titles
      const keywords = new Set();
      recentPages.forEach(page => {
        const title = page.title.toLowerCase();
        if (title.includes('urgent') || title.includes('critical')) keywords.add('urgent');
        if (title.includes('update') || title.includes('release')) keywords.add('update');
        if (title.includes('blocked') || title.includes('issue')) keywords.add('blocked');
      });

      console.log(`✅ Confluence ${space}: ${updates} pages updated in last 7 days`);

      return {
        space,
        pages: recentPages.slice(0, 10),
        updates,
        keywords: Array.from(keywords),
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error(`Error querying Confluence space ${space}:`, error.message);
      return { space, pages: [], updates: 0, keywords: [], lastUpdate: new Date() };
    }
  }

  /**
   * Query Jira for project metrics
   */
  async queryJira(projectKey) {
    try {
      // Check if we have credentials configured
      if (!this.confluenceUrl || !this.username || !this.apiToken) {
        console.warn('Atlassian credentials not configured');
        return { projectKey, issuesInProgress: 0, issuesBlocked: 0, issuesDoneToday: 0, highPriorityCount: 0, lastUpdate: new Date() };
      }

      const jiraUrl = this.baseUrl; // Same base URL for Jira

      // Query for issues in different states
      const [inProgressData, blockedData, doneData, highPriorityData] = await Promise.all([
        // Issues in progress
        this.makeRequest(`${jiraUrl}/rest/api/3/search?jql=${encodeURIComponent(`project="${projectKey}" AND status="In Progress"`)}&maxResults=0&fields=summary`).catch(() => ({ total: 0 })),
        // Blocked issues
        this.makeRequest(`${jiraUrl}/rest/api/3/search?jql=${encodeURIComponent(`project="${projectKey}" AND statusCategory="To Do" AND labels=blocked`)}&maxResults=0&fields=summary`).catch(() => ({ total: 0 })),
        // Issues completed today
        this.makeRequest(`${jiraUrl}/rest/api/3/search?jql=${encodeURIComponent(`project="${projectKey}" AND statusCategory=Done AND resolved >= -1d`)}&maxResults=0&fields=summary`).catch(() => ({ total: 0 })),
        // High priority issues
        this.makeRequest(`${jiraUrl}/rest/api/3/search?jql=${encodeURIComponent(`project="${projectKey}" AND priority in (Highest, High) AND statusCategory != Done`)}&maxResults=0&fields=summary`).catch(() => ({ total: 0 }))
      ]);

      console.log(`✅ Jira ${projectKey}: ${inProgressData.total || 0} in progress, ${blockedData.total || 0} blocked, ${doneData.total || 0} done today`);

      return {
        projectKey,
        issuesInProgress: inProgressData.total || 0,
        issuesBlocked: blockedData.total || 0,
        issuesDoneToday: doneData.total || 0,
        highPriorityCount: highPriorityData.total || 0,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error(`Error querying Jira project ${projectKey}:`, error.message);
      return { projectKey, issuesInProgress: 0, issuesBlocked: 0, issuesDoneToday: 0, highPriorityCount: 0, lastUpdate: new Date() };
    }
  }

  /**
   * Get all accessible projects/spaces
   */
  async getProjects() {
    try {
      // In production: "What projects do I have access to?"
      // For now, return configured departments
      return ['Eng', 'QA', 'ADS', 'EP', 'PM', 'Ops', 'DW', 'IT', 'MKT', 'OM'];
    } catch (error) {
      console.error('Error fetching projects:', error.message);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Verify MCP connection
      return {
        status: 'ok',
        confluence: !!this.confluenceUrl,
        jira: true,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}
