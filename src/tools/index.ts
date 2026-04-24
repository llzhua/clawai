/**
 * 🔧 工具系统
 * Agent 可调用的工具集合
 */
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(params: Record<string, unknown>): Promise<unknown>;
}
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
    console.log(`🔧 工具已注册: ${tool.name}`);
  }
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  list(): Tool[] {
    return Array.from(this.tools.values());
  }
  async execute(name: string, params: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`工具不存在: ${name}`);
    }
    return tool.execute(params);
  }
}