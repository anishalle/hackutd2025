/**
 * BUNDLING ENGINE
 * Intelligently groups datacenter tasks that can be executed in parallel
 * 
 * Algorithm:
 * 1. Analyzes task compatibility based on:
 *    - Task category (software, hardware, network, maintenance)
 *    - Physical location (building, floor, aisle, rack)
 *    - Time window overlap
 *    - Priority level compatibility
 *    - Resource conflicts
 * 2. Scores each task pair (0-100)
 * 3. Groups tasks with high compatibility scores
 * 4. Returns bundles with visual metadata
 */

export type TaskCategory = 'PROVISIONING' | 'ACCESS_CONTROL' | 'CONFIGURATION' | 'DEPLOYMENT' | 'MONITORING' | 'EMERGENCY';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'standard';

export interface TaskLocation {
  building?: string;
  floor?: string;
  aisle?: string;
  rack?: string;
  region?: string;
}

export interface EnhancedTask {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  eta: string;
  details: string;
  parallelGroup?: string;
  source?: 'manual' | 'slack' | 'email';
  category?: TaskCategory;
  taskType?: string;
  location?: TaskLocation;
  timeWindow?: string;
  estimatedDuration?: number;
  priority?: TaskPriority;
  company?: string;
  resourceRequirements?: {
    crew?: string;
    requiresShutdown?: boolean;
    requiresVendorAccess?: boolean;
  };
  dependencies?: string[];
}

export interface Bundle {
  id: string;
  tasks: EnhancedTask[];
  bundleScore: number;
  reasons: string[];
  color: string;
}

interface CompatibilityResult {
  score: number;
  reasons: string[];
}

const BUNDLING_RULES = {
  compatibleCategories: {
    PROVISIONING: ['PROVISIONING', 'DEPLOYMENT'],  // Provisioning can bundle with deployment
    ACCESS_CONTROL: ['ACCESS_CONTROL', 'CONFIGURATION'],  // Access control can bundle with configs
    CONFIGURATION: ['CONFIGURATION', 'ACCESS_CONTROL'],  // Configs can bundle together
    DEPLOYMENT: ['DEPLOYMENT', 'PROVISIONING'],  // Deployments can bundle with provisioning
    MONITORING: ['MONITORING', 'CONFIGURATION'],  // Monitoring setup can bundle with configs
    EMERGENCY: []  // Emergency tasks never bundle
  },
  minimumOverlapMinutes: 30,
  priorityBundling: {
    critical: ['critical'],
    high: ['high', 'critical'],
    medium: ['medium', 'high'],
    standard: ['standard', 'medium']
  }
};

const BUNDLE_COLORS = [
  'from-purple-500/40 to-purple-500/10 border-purple-500/40',
  'from-blue-500/40 to-blue-500/10 border-blue-500/40',
  'from-green-500/40 to-green-500/10 border-green-500/40',
  'from-orange-500/40 to-orange-500/10 border-orange-500/40',
  'from-pink-500/40 to-pink-500/10 border-pink-500/40',
  'from-teal-500/40 to-teal-500/10 border-teal-500/40',
];

export class BundlingEngine {
  private rules = BUNDLING_RULES;

  /**
   * Main bundling function
   */
  bundleTasks(tasks: EnhancedTask[]): Bundle[] {
    // Emergency or critical severity tasks are never bundled
    const unbundleableTasks = tasks.filter(
      t => t.category === 'EMERGENCY' || t.severity === 'critical'
    );
    
    const bundleableTasks = tasks.filter(
      t => t.category !== 'EMERGENCY' && t.severity !== 'critical'
    );

    // Build compatibility matrix
    const compatibilityMatrix = this.buildCompatibilityMatrix(bundleableTasks);

    // Find optimal bundles
    const bundles = this.findOptimalBundles(bundleableTasks, compatibilityMatrix);

    // Add unbundled tasks as individual bundles
    const unbundledBundles = unbundleableTasks.map((task, idx) => ({
      id: `bundle-critical-${idx}`,
      tasks: [task],
      bundleScore: 0,
      reasons: [task.severity === 'critical' ? 'Critical priority - cannot bundle' : 'Emergency task - cannot bundle'],
      color: 'from-rose-500/40 to-rose-500/10 border-rose-500/40'
    }));

    return [...unbundledBundles, ...bundles];
  }

  /**
   * Calculate compatibility score between two tasks
   */
  private calculateCompatibility(task1: EnhancedTask, task2: EnhancedTask): CompatibilityResult {
    let score = 0;
    const reasons: string[] = [];

    // Check 1: Category compatibility (30 points)
    if (this.areCategoriesCompatible(task1.category, task2.category)) {
      score += 30;
      reasons.push('Compatible categories');
    }

    // Check 2: Location compatibility (25 points)
    const locationScore = this.checkLocationCompatibility(task1, task2);
    score += locationScore;
    if (locationScore > 0) {
      reasons.push('Compatible locations');
    }

    // Check 3: Time window overlap (20 points)
    if (task1.timeWindow && task2.timeWindow) {
      const overlap = this.calculateTimeOverlap(task1.timeWindow, task2.timeWindow);
      if (overlap >= this.rules.minimumOverlapMinutes) {
        score += 20;
        reasons.push(`${overlap}min overlap`);
      }
    } else {
      score += 10; // No time constraint
    }

    // Check 4: Priority compatibility (15 points)
    if (this.arePrioritiesCompatible(task1.priority, task2.priority)) {
      score += 15;
      reasons.push('Compatible priorities');
    }

    // Check 5: No resource conflicts (10 points)
    if (!this.hasResourceConflict(task1, task2)) {
      score += 10;
      reasons.push('No conflicts');
    }

    // Penalty: Same company (prefer bundling same customer tasks)
    if (task1.company && task2.company && task1.company === task2.company) {
      score += 10;
      reasons.push(`Same customer (${task1.company})`);
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      reasons
    };
  }

  private areCategoriesCompatible(cat1?: TaskCategory, cat2?: TaskCategory): boolean {
    if (!cat1 || !cat2) return true;
    const compatible = this.rules.compatibleCategories[cat1] || [];
    return compatible.includes(cat2);
  }

  private checkLocationCompatibility(task1: EnhancedTask, task2: EnhancedTask): number {
    const loc1 = task1.location;
    const loc2 = task2.location;

    if (!loc1 || !loc2) return 20;

    // For admin tasks, location matters less since everything is virtual
    // We care more about logical groupings (region, cluster)
    
    // Different regions = still good for admin tasks (can run in parallel)
    if (loc1.region && loc2.region && loc1.region !== loc2.region) return 25;

    // Same region = perfect for batching
    if (loc1.region && loc2.region && loc1.region === loc2.region) return 25;

    // Same building/datacenter = can definitely run together
    if (loc1.building && loc2.building && loc1.building === loc2.building) return 20;

    // Admin tasks don't have physical space conflicts
    return 15;
  }

  private calculateTimeOverlap(window1: string, window2: string): number {
    const [start1, end1] = this.parseTimeWindow(window1);
    const [start2, end2] = this.parseTimeWindow(window2);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    return Math.max(0, overlapEnd - overlapStart);
  }

  private parseTimeWindow(window: string): [number, number] {
    if (window.startsWith('Now')) {
      return [0, this.parseTime(window.split('-')[1])];
    }

    const [start, end] = window.split('-');
    return [this.parseTime(start), this.parseTime(end)];
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private arePrioritiesCompatible(priority1?: TaskPriority, priority2?: TaskPriority): boolean {
    if (!priority1 || !priority2) return true;
    const compatible = this.rules.priorityBundling[priority1] || [];
    return compatible.includes(priority2);
  }

  private hasResourceConflict(task1: EnhancedTask, task2: EnhancedTask): boolean {
    const req1 = task1.resourceRequirements;
    const req2 = task2.resourceRequirements;

    if (!req1 || !req2) return false;

    // Both require shutdown = conflict
    if (req1.requiresShutdown && req2.requiresShutdown) return true;

    // Both require vendor access = conflict
    if (req1.requiresVendorAccess && req2.requiresVendorAccess) return true;

    return false;
  }

  private buildCompatibilityMatrix(tasks: EnhancedTask[]): Record<string, Record<string, CompatibilityResult>> {
    const matrix: Record<string, Record<string, CompatibilityResult>> = {};

    for (let i = 0; i < tasks.length; i++) {
      matrix[tasks[i].id] = {};
      for (let j = 0; j < tasks.length; j++) {
        if (i !== j) {
          matrix[tasks[i].id][tasks[j].id] = this.calculateCompatibility(tasks[i], tasks[j]);
        }
      }
    }

    return matrix;
  }

  private findOptimalBundles(
    tasks: EnhancedTask[],
    compatibilityMatrix: Record<string, Record<string, CompatibilityResult>>
  ): Bundle[] {
    const bundles: Bundle[] = [];
    const bundled = new Set<string>();
    const THRESHOLD = 60; // Minimum score to bundle

    // Sort by priority
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, standard: 1 };
      return (priorityOrder[b.priority || 'standard'] || 0) - (priorityOrder[a.priority || 'standard'] || 0);
    });

    let colorIndex = 0;

    for (const task of sortedTasks) {
      if (bundled.has(task.id)) continue;

      const bundle: Bundle = {
        id: `bundle-${bundles.length + 1}`,
        tasks: [task],
        bundleScore: 0,
        reasons: [],
        color: BUNDLE_COLORS[colorIndex % BUNDLE_COLORS.length]
      };

      bundled.add(task.id);

      // Try to add compatible tasks
      for (const otherTask of sortedTasks) {
        if (bundled.has(otherTask.id)) continue;

        const compatibilities = bundle.tasks.map(
          t => compatibilityMatrix[t.id]?.[otherTask.id]
        ).filter(Boolean);

        if (compatibilities.length === 0) continue;

        const avgScore = compatibilities.reduce((sum, c) => sum + c.score, 0) / compatibilities.length;

        if (avgScore >= THRESHOLD) {
          bundle.tasks.push(otherTask);
          bundle.reasons = compatibilities[0].reasons;
          bundled.add(otherTask.id);
        }
      }

      // Calculate cosine similarity score for the bundle
      if (bundle.tasks.length > 1) {
        bundle.bundleScore = this.calculateCosineSimilarity(bundle.tasks);
      } else {
        bundle.bundleScore = 0;
      }

      bundles.push(bundle);
      colorIndex++;
    }

    return bundles;
  }

  /**
   * Calculate cosine similarity for tasks in a bundle
   * Converts tasks to feature vectors and computes average pairwise similarity
   */
  private calculateCosineSimilarity(tasks: EnhancedTask[]): number {
    if (tasks.length < 2) return 0;

    // Create feature vectors for each task
    const vectors = tasks.map(task => this.taskToVector(task));

    // Calculate pairwise cosine similarities
    let totalSimilarity = 0;
    let pairCount = 0;

    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const similarity = this.cosineSimilarityBetweenVectors(vectors[i], vectors[j]);
        totalSimilarity += similarity;
        pairCount++;
      }
    }

    // Average similarity as percentage
    const avgSimilarity = pairCount > 0 ? totalSimilarity / pairCount : 0;
    return Math.round(avgSimilarity * 100);
  }

  /**
   * Convert a task to a feature vector
   */
  private taskToVector(task: EnhancedTask): number[] {
    const vector: number[] = [];

    // Category features (one-hot encoding)
    const categories = ['PROVISIONING', 'ACCESS_CONTROL', 'CONFIGURATION', 'DEPLOYMENT', 'MONITORING', 'EMERGENCY'];
    categories.forEach(cat => vector.push(task.category === cat ? 1 : 0));

    // Priority features (one-hot encoding)
    const priorities = ['critical', 'high', 'medium', 'standard'];
    priorities.forEach(pri => vector.push(task.priority === pri ? 1 : 0));

    // Severity features (one-hot encoding)
    const severities = ['critical', 'high', 'medium'];
    severities.forEach(sev => vector.push(task.severity === sev ? 1 : 0));

    // Location features (normalized)
    vector.push(task.location?.region ? 1 : 0);
    vector.push(task.location?.building ? 1 : 0);

    // Time window feature (normalized - presence of time constraint)
    vector.push(task.timeWindow ? 1 : 0);

    // Company feature (normalized - has specific customer)
    vector.push(task.company ? 1 : 0);

    // Resource requirements features
    vector.push(task.resourceRequirements?.requiresShutdown ? 1 : 0);
    vector.push(task.resourceRequirements?.requiresVendorAccess ? 1 : 0);

    return vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarityBetweenVectors(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
  }
}

