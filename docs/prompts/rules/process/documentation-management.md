# Documentation Management

Comprehensive documentation standards, project workflow, and Architectural Decision Records (ADR) guidelines for the Roo Code VS Code Extension project.

## New Project Workflow

### Project Initiation Process
1. **Enhancement**: Use prompt_enhancer tool for requirement analysis
2. **Research**: Conduct deep research with Chain of Thought reasoning
3. **Planning**: Create `./docs/PLAN.md` for user review
4. **Refinement**: Question constraints and refine requirements
5. **Approval**: Get user approval before proceeding
6. **PRD**: Create `./docs/PRD.md` (Product Requirements Document)

### Documentation Creation Workflow
```typescript
// ✅ PREFERRED: Structured documentation workflow
interface ProjectDocumentation {
  planning: {
    planMd: string;
    prdMd: string;
    requirementsMd: string;
  };
  architecture: {
    architectureMd: string;
    systemMd: string;
    adrDirectory: string[];
  };
  process: {
    changelogMd: string;
    roadmapMd: string;
    tasksMd: string;
    sessionMd: string;
  };
  standards: {
    standardsMd: string;
    codingRules: string[];
  };
}

class DocumentationManager {
  async initializeProjectDocs(projectName: string): Promise<void> {
    const docsStructure = this.getDocumentationStructure();
    
    await this.createInitialDocs(projectName, docsStructure);
    await this.setupTaskManagement(projectName);
    await this.initializeADRs();
  }

  private getDocumentationStructure(): DocumentationStructure {
    return {
      root: './README.md',
      docs: {
        'ARCHITECTURE.md': 'System architecture and design decisions',
        'CHANGELOG.md': 'Version history and changes',
        'REQUIREMENTS.md': 'Functional and non-functional requirements',
        'ROADMAP.md': 'Future development plans',
        'SESSION.md': 'Current development session notes',
        'STANDARDS.md': 'Coding standards and conventions',
        'SYSTEM.md': 'System overview and components',
        'TASKS.md': 'Task management and tracking'
      },
      subdirectories: {
        'ADR/': 'Architectural Decision Records',
        'tasks/': 'Phase-based task breakdown'
      }
    };
  }

  private async createInitialDocs(
    projectName: string,
    structure: DocumentationStructure
  ): Promise<void> {
    // Create README.md with navigation
    await this.createReadme(projectName, structure);
    
    // Create individual documentation files
    for (const [filename, description] of Object.entries(structure.docs)) {
      await this.createDocumentationFile(filename, description, projectName);
    }
  }

  private async createReadme(
    projectName: string,
    structure: DocumentationStructure
  ): Promise<void> {
    const readmeContent = `# ${projectName}

## Overview
Brief description of the project and its purpose.

## Quick Start
Instructions for getting started with the project.

## Documentation
- [Architecture](docs/ARCHITECTURE.md) - ${structure.docs['ARCHITECTURE.md']}
- [Requirements](docs/REQUIREMENTS.md) - ${structure.docs['REQUIREMENTS.md']}
- [Standards](docs/STANDARDS.md) - ${structure.docs['STANDARDS.md']}
- [Tasks](docs/TASKS.md) - ${structure.docs['TASKS.md']}
- [Roadmap](docs/ROADMAP.md) - ${structure.docs['ROADMAP.md']}
- [Changelog](docs/CHANGELOG.md) - ${structure.docs['CHANGELOG.md']}

## Development
- [System Overview](docs/SYSTEM.md) - ${structure.docs['SYSTEM.md']}
- [Current Session](docs/SESSION.md) - ${structure.docs['SESSION.md']}
- [Architectural Decisions](docs/ADR/) - Decision records and rationale

## Contributing
Please read our standards and guidelines before contributing.
`;

    await this.writeFile('./README.md', readmeContent);
  }
}

interface DocumentationStructure {
  root: string;
  docs: Record<string, string>;
  subdirectories: Record<string, string>;
}
```

## Documentation Structure Standards

### Recommended Structure
```
./README.md (summary, navigation, usage)
./docs/
├── ARCHITECTURE.md
├── CHANGELOG.md
├── REQUIREMENTS.md
├── ROADMAP.md
├── SESSION.md
├── STANDARDS.md
├── SYSTEM.md
├── TASKS.md
├── ADR/ (Architectural Decision Records)
│   ├── 001-error-handling-pattern.md
│   ├── 002-state-management-approach.md
│   └── 003-api-client-design.md
└── tasks/
    ├── PHASE1_TASKS.md
    ├── PHASE2_TASKS.md
    └── ...
```

### File Content Standards
```typescript
// ✅ PREFERRED: Consistent documentation templates
interface DocumentTemplate {
  filename: string;
  title: string;
  sections: string[];
  metadata: DocumentMetadata;
}

interface DocumentMetadata {
  lastUpdated: string;
  version: string;
  author: string;
  reviewers: string[];
}

const documentTemplates: Record<string, DocumentTemplate> = {
  'ARCHITECTURE.md': {
    filename: 'ARCHITECTURE.md',
    title: 'System Architecture',
    sections: [
      'Overview',
      'System Components',
      'Data Flow',
      'Technology Stack',
      'Design Patterns',
      'Integration Points',
      'Security Considerations',
      'Performance Considerations'
    ],
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      author: 'Development Team',
      reviewers: []
    }
  },
  
  'REQUIREMENTS.md': {
    filename: 'REQUIREMENTS.md',
    title: 'Project Requirements',
    sections: [
      'Functional Requirements',
      'Non-Functional Requirements',
      'User Stories',
      'Acceptance Criteria',
      'Constraints',
      'Assumptions',
      'Dependencies'
    ],
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      author: 'Product Team',
      reviewers: []
    }
  }
};
```

## Architectural Decision Records (ADRs)

### ADR Template and Standards
```markdown
# ADR-001: Error Handling Pattern

## Status
Accepted

## Context
We need a consistent way to handle errors across the application to ensure reliability and maintainability.

## Decision
Use Result<T, E> pattern for all operations that can fail, providing explicit error handling and type safety.

## Consequences
### Positive
- Explicit error handling prevents silent failures
- Type-safe error propagation
- Consistent API across modules
- Better debugging and monitoring capabilities

### Negative
- Requires training for developers unfamiliar with the pattern
- Slightly more verbose than traditional try-catch
- Need to maintain error type definitions

## Implementation
```typescript
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

async function fetchUserData(id: string): Promise<Result<User, ApiError>> {
  try {
    const response = await api.get(`/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: new ApiError('Failed to fetch user', error) };
  }
}
```

## Related Decisions
- ADR-002: State Management Approach
- ADR-003: API Client Design

## References
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [Rust Result Type](https://doc.rust-lang.org/std/result/)
```

### ADR Management System
```typescript
// ✅ PREFERRED: ADR management and tracking
interface ADR {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'superseded';
  date: string;
  context: string;
  decision: string;
  consequences: {
    positive: string[];
    negative: string[];
  };
  relatedDecisions: string[];
  implementation?: string;
  references?: string[];
}

class ADRManager {
  private adrs: Map<string, ADR> = new Map();

  async createADR(adr: Omit<ADR, 'id' | 'date'>): Promise<string> {
    const id = this.generateADRId();
    const fullADR: ADR = {
      ...adr,
      id,
      date: new Date().toISOString().split('T')[0]
    };

    this.adrs.set(id, fullADR);
    await this.writeADRFile(fullADR);
    await this.updateADRIndex();

    return id;
  }

  async updateADRStatus(id: string, status: ADR['status']): Promise<void> {
    const adr = this.adrs.get(id);
    if (!adr) {
      throw new Error(`ADR ${id} not found`);
    }

    adr.status = status;
    await this.writeADRFile(adr);
    await this.updateADRIndex();
  }

  async linkADRs(fromId: string, toId: string): Promise<void> {
    const fromADR = this.adrs.get(fromId);
    const toADR = this.adrs.get(toId);

    if (!fromADR || !toADR) {
      throw new Error('One or both ADRs not found');
    }

    if (!fromADR.relatedDecisions.includes(toId)) {
      fromADR.relatedDecisions.push(toId);
      await this.writeADRFile(fromADR);
    }

    if (!toADR.relatedDecisions.includes(fromId)) {
      toADR.relatedDecisions.push(fromId);
      await this.writeADRFile(toADR);
    }

    await this.updateADRIndex();
  }

  private generateADRId(): string {
    const existingIds = Array.from(this.adrs.keys())
      .map(id => parseInt(id.split('-')[1]))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    return `ADR-${nextNumber.toString().padStart(3, '0')}`;
  }

  private async writeADRFile(adr: ADR): Promise<void> {
    const content = this.formatADRContent(adr);
    const filename = `./docs/ADR/${adr.id.toLowerCase()}-${this.slugify(adr.title)}.md`;
    await this.writeFile(filename, content);
  }

  private formatADRContent(adr: ADR): string {
    return `# ${adr.id}: ${adr.title}

## Status
${adr.status.charAt(0).toUpperCase() + adr.status.slice(1)}

## Date
${adr.date}

## Context
${adr.context}

## Decision
${adr.decision}

## Consequences

### Positive
${adr.consequences.positive.map(item => `- ${item}`).join('\n')}

### Negative
${adr.consequences.negative.map(item => `- ${item}`).join('\n')}

${adr.implementation ? `## Implementation\n${adr.implementation}\n` : ''}

${adr.relatedDecisions.length > 0 ? `## Related Decisions\n${adr.relatedDecisions.map(id => `- ${id}`).join('\n')}\n` : ''}

${adr.references && adr.references.length > 0 ? `## References\n${adr.references.map(ref => `- ${ref}`).join('\n')}` : ''}
`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async updateADRIndex(): Promise<void> {
    const indexContent = this.generateADRIndex();
    await this.writeFile('./docs/ADR/README.md', indexContent);
  }

  private generateADRIndex(): string {
    const sortedADRs = Array.from(this.adrs.values())
      .sort((a, b) => a.id.localeCompare(b.id));

    const content = `# Architectural Decision Records

This directory contains all architectural decision records for the project.

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
${sortedADRs.map(adr => 
  `| [${adr.id}](./${adr.id.toLowerCase()}-${this.slugify(adr.title)}.md) | ${adr.title} | ${adr.status} | ${adr.date} |`
).join('\n')}

## Status Legend
- **Proposed**: Under consideration
- **Accepted**: Approved and implemented
- **Rejected**: Considered but not adopted
- **Superseded**: Replaced by a newer decision
`;

    return content;
  }

  private async writeFile(filename: string, content: string): Promise<void> {
    // Implementation for writing file
    console.log(`Writing ${filename}`);
  }
}
```

## Task Management Integration

### Phase-Based Task Organization
```typescript
// ✅ PREFERRED: Structured task management
interface TaskPhase {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  dependencies: string[];
  estimatedDuration: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  estimatedHours: number;
  actualHours?: number;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dependencies: string[];
  tags: string[];
}

class TaskDocumentationManager {
  async generatePhaseDocumentation(phase: TaskPhase): Promise<string> {
    return `# ${phase.name}

## Overview
${phase.description}

## Status
${phase.status.toUpperCase()}

## Estimated Duration
${phase.estimatedDuration}

## Dependencies
${phase.dependencies.length > 0 ? phase.dependencies.map(dep => `- ${dep}`).join('\n') : 'None'}

## Tasks

${phase.tasks.map(task => this.formatTask(task)).join('\n\n')}

## Progress
- Total Tasks: ${phase.tasks.length}
- Completed: ${phase.tasks.filter(t => t.status === 'done').length}
- In Progress: ${phase.tasks.filter(t => t.status === 'in-progress').length}
- Remaining: ${phase.tasks.filter(t => t.status === 'todo').length}
`;
  }

  private formatTask(task: Task): string {
    const statusIcon = this.getStatusIcon(task.status);
    return `### ${statusIcon} ${task.title}

**Description:** ${task.description}

**Estimated Hours:** ${task.estimatedHours}
${task.actualHours ? `**Actual Hours:** ${task.actualHours}` : ''}
${task.assignee ? `**Assignee:** ${task.assignee}` : ''}

**Dependencies:** ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
**Tags:** ${task.tags.join(', ')}`;
  }

  private getStatusIcon(status: Task['status']): string {
    const icons = {
      'todo': '⏳',
      'in-progress': '🔄',
      'review': '👀',
      'done': '✅'
    };
    return icons[status];
  }
}
```

## Best Practices Summary

### Do's
- ✅ Follow structured project initiation workflow
- ✅ Create comprehensive documentation from the start
- ✅ Use ADRs for all significant architectural decisions
- ✅ Maintain consistent documentation templates
- ✅ Link related documents and decisions
- ✅ Update documentation with code changes
- ✅ Use phase-based task organization

### Don'ts
- ❌ Skip documentation planning phase
- ❌ Create documentation without clear structure
- ❌ Make architectural decisions without recording rationale
- ❌ Use inconsistent formatting across documents
- ❌ Let documentation become outdated
- ❌ Create overly complex documentation hierarchies

## Related Documentation

- [Development Methodology](development-methodology.md) - Development process and quality gates
- [Deployment & Release](deployment-release.md) - Release documentation requirements
- [Development Workflow](../checklists/development-workflow.md) - Documentation in development process
- [Code Quality & Linting](../quality/code-quality-linting.md) - Documentation quality standards

---

*Proper documentation management ensures project knowledge is preserved, decisions are traceable, and team collaboration is effective.*
