/**
 * @physmark/core — Plugin registry
 */

import type { PhysMarkPlugin } from './types';

export class PhysMarkPluginRegistry {
  private plugins = new Map<string, PhysMarkPlugin>();
  private languageIndex = new Map<string, PhysMarkPlugin>();

  register(plugin: PhysMarkPlugin): void {
    this.plugins.set(plugin.id, plugin);
    for (const decl of plugin.syntaxDeclarations) {
      this.languageIndex.set(decl.language, plugin);
    }
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    for (const decl of plugin.syntaxDeclarations) {
      this.languageIndex.delete(decl.language);
    }
    this.plugins.delete(pluginId);
  }

  getByLanguage(language: string): PhysMarkPlugin | undefined {
    return this.languageIndex.get(language);
  }

  getById(id: string): PhysMarkPlugin | undefined {
    return this.plugins.get(id);
  }

  getRegisteredLanguages(): string[] {
    return Array.from(this.languageIndex.keys());
  }

  getAllPlugins(): PhysMarkPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const globalRegistry = new PhysMarkPluginRegistry();
