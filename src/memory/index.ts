/**
 * 🧠 记忆系统
 * 短期记忆 + 长期持久化记忆
 */
export interface MemoryEntry {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
export class MemoryStore {
  private shortTerm: MemoryEntry[] = [];
  private maxShortTerm: number = 100;
  async add(entry: MemoryEntry): Promise<void> {
    this.shortTerm.push(entry);
    if (this.shortTerm.length > this.maxShortTerm) {
      // TODO: 溢出到长期存储
      this.shortTerm.shift();
    }
  }
  async recall(sessionId: string, limit: number = 10): Promise<MemoryEntry[]> {
    return this.shortTerm
      .filter(e => e.sessionId === sessionId)
      .slice(-limit);
  }
  async search(query: string): Promise<MemoryEntry[]> {
    // TODO: 实现语义搜索
    return this.shortTerm.filter(e =>
      e.content.toLowerCase().includes(query.toLowerCase())
    );
  }
}