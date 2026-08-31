import { Note, SyncStatus } from '../types';
import { api } from './api';
import { offlineStorage } from './offlineStorage';

type SyncListener = (status: SyncStatus, pendingCount: number) => void;

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private status: SyncStatus = 'online';
  private syncInProgress = false;
  private pendingCount = 0;
  private syncInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setStatus('online');
        this.triggerSync();
      });

      window.addEventListener('offline', () => {
        this.setStatus('offline');
      });
    }
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.pendingCount);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.status, this.pendingCount);
    }
  }

  setStatus(status: SyncStatus) {
    this.status = status;
    this.notify();
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  getPendingCount(): number {
    return this.pendingCount;
  }

  async updatePendingCount(userId: string): Promise<number> {
    if (!userId) return 0;
    const actions = await offlineStorage.getPendingActions(userId);
    this.pendingCount = actions.length;
    this.notify();
    return this.pendingCount;
  }

  startPeriodicSync(userId: string, intervalMs: number = 20000) {
    this.stopPeriodicSync();
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncNotes(userId).catch(() => {});
      }
    }, intervalMs);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  triggerSync(userId?: string): Promise<Note[] | null> {
    if (!userId) return Promise.resolve(null);
    return this.syncNotes(userId);
  }

  async syncNotes(userId: string): Promise<Note[] | null> {
    if (!navigator.onLine) {
      this.setStatus('offline');
      await this.updatePendingCount(userId);
      return null;
    }

    if (this.syncInProgress) return null;
    this.syncInProgress = true;
    this.setStatus('syncing');

    try {
      // 1. Fetch pending offline actions
      const pendingActions = await offlineStorage.getPendingActions(userId);
      const localNotes = await offlineStorage.getUserNotes(userId);

      const deletedIds = pendingActions
        .filter((a) => a.action === 'delete')
        .map((a) => a.noteId);

      // 2. Call batch sync endpoint with client notes and deletions
      const syncResult = await api.batchSync(localNotes, deletedIds);

      if (syncResult && syncResult.notes) {
        // 3. Clear processed actions from local queue
        await offlineStorage.clearPendingActions(userId);
        
        // 4. Overwrite local storage with the authoritative server state
        await offlineStorage.saveUserNotes(userId, syncResult.notes);

        this.pendingCount = 0;
        this.setStatus('synced');
        
        // Return back to 'online' status indicator after 3 seconds
        setTimeout(() => {
          if (this.status === 'synced') {
            this.setStatus('online');
          }
        }, 3000);

        return syncResult.notes;
      }
    } catch (err: any) {
      console.warn('Sync failed, continuing in offline/cached mode:', err);
      if (!navigator.onLine || err.status === 0) {
        this.setStatus('offline');
      } else {
        this.setStatus('error');
      }
      await this.updatePendingCount(userId);
    } finally {
      this.syncInProgress = false;
    }

    return null;
  }
}

export const syncManager = new SyncManager();
