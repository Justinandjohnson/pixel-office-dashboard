/**
 * Pixel Office Dashboard - WebSocket Server
 * Polls Atlassian data and broadcasts room states to clients
 */

import { WebSocketServer } from 'ws';
import 'dotenv/config';
import { AtlassianMCPClient } from './atlassian-client.js';
import { determineRoomState, calculateCharacterCount } from './state-analyzer.js';
import { DEPARTMENTS, POLL_INTERVALS } from '../../shared/department-config.js';

const PORT = process.env.WEBSOCKET_PORT || 8080;

class DashboardServer {
  constructor() {
    this.wss = new WebSocketServer({ port: PORT });
    this.atlassian = new AtlassianMCPClient();
    this.departmentStates = new Map();
    this.updateTimers = new Map();
  }

  async start() {
    console.log(`🚀 Pixel Office Dashboard Server starting...`);
    
    // Health check
    const health = await this.atlassian.healthCheck();
    console.log(`📊 Atlassian connection:`, health.status);
    
    // Initial data fetch
    await this.refreshAllDepartments();
    
    // Set up tiered polling intervals
    this.setupPolling();
    
    // Handle WebSocket connections
    this.wss.on('connection', (ws) => {
      console.log('🔌 Client connected');
      
      // Send initial state immediately
      const initialState = this.buildUpdateMessage();
      ws.send(JSON.stringify(initialState));
      
      ws.on('close', () => {
        console.log('🔌 Client disconnected');
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
      });
    });
    
    console.log(`✅ Server running on ws://localhost:${PORT}`);
    console.log(`📡 Polling intervals configured:`);
    console.log(`   - High activity (${POLL_INTERVALS.HIGH_ACTIVITY.spaces.join(', ')}): ${POLL_INTERVALS.HIGH_ACTIVITY.interval}ms`);
    console.log(`   - Medium activity (${POLL_INTERVALS.MEDIUM_ACTIVITY.spaces.join(', ')}): ${POLL_INTERVALS.MEDIUM_ACTIVITY.interval}ms`);
    console.log(`   - Low activity (${POLL_INTERVALS.LOW_ACTIVITY.spaces.join(', ')}): ${POLL_INTERVALS.LOW_ACTIVITY.interval}ms`);
  }

  setupPolling() {
    // High activity departments (30s)
    const highInterval = setInterval(async () => {
      await this.refreshDepartmentsTier(POLL_INTERVALS.HIGH_ACTIVITY.spaces);
    }, POLL_INTERVALS.HIGH_ACTIVITY.interval);
    this.updateTimers.set('high', highInterval);
    
    // Medium activity departments (60s)
    const mediumInterval = setInterval(async () => {
      await this.refreshDepartmentsTier(POLL_INTERVALS.MEDIUM_ACTIVITY.spaces);
    }, POLL_INTERVALS.MEDIUM_ACTIVITY.interval);
    this.updateTimers.set('medium', mediumInterval);
    
    // Low activity departments (2min)
    const lowInterval = setInterval(async () => {
      await this.refreshDepartmentsTier(POLL_INTERVALS.LOW_ACTIVITY.spaces);
    }, POLL_INTERVALS.LOW_ACTIVITY.interval);
    this.updateTimers.set('low', lowInterval);
  }

  async refreshAllDepartments() {
    console.log('🔄 Refreshing all departments...');
    const departments = DEPARTMENTS.map(d => d.code);
    await this.refreshDepartmentsTier(departments);
  }

  async refreshDepartmentsTier(departmentCodes) {
    const updates = await Promise.all(
      departmentCodes.map(code => this.fetchDepartmentData(code))
    );
    
    // Update state and broadcast if changed
    let hasChanges = false;
    updates.forEach(update => {
      const prev = this.departmentStates.get(update.space);
      if (!prev || prev.state !== update.state) {
        hasChanges = true;
      }
      this.departmentStates.set(update.space, update);
    });
    
    if (hasChanges) {
      this.broadcast();
    }
  }

  async fetchDepartmentData(space) {
    try {
      // Query both Confluence and Jira in parallel
      const [confluenceData, jiraData] = await Promise.all([
        this.atlassian.queryConfluence(space),
        this.atlassian.queryJira(space)
      ]);
      
      // Determine room state from combined data
      const { state, metadata } = determineRoomState(confluenceData, jiraData);
      
      // Calculate character count
      const characterCount = calculateCharacterCount(state, {
        confluenceUpdates: confluenceData.updates,
        jiraInProgress: jiraData.issuesInProgress
      });
      
      return {
        space,
        state,
        characterCount,
        metadata: {
          ...metadata,
          lastUpdate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`❌ Error fetching data for ${space}:`, error.message);
      
      // Return safe default
      return {
        space,
        state: 'idle',
        characterCount: 0,
        metadata: {
          error: error.message,
          lastUpdate: new Date().toISOString()
        }
      };
    }
  }

  buildUpdateMessage() {
    return {
      type: 'update',
      timestamp: new Date().toISOString(),
      departments: Array.from(this.departmentStates.values())
    };
  }

  broadcast() {
    const message = JSON.stringify(this.buildUpdateMessage());
    
    let clientCount = 0;
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
        clientCount++;
      }
    });
    
    if (clientCount > 0) {
      console.log(`📤 Broadcast to ${clientCount} client(s)`);
    }
  }

  stop() {
    console.log('🛑 Shutting down server...');
    
    // Clear all timers
    this.updateTimers.forEach(timer => clearInterval(timer));
    this.updateTimers.clear();
    
    // Close WebSocket server
    this.wss.close(() => {
      console.log('✅ Server stopped');
    });
  }
}

// Start server
const server = new DashboardServer();
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.stop();
  process.exit(0);
});
