# Kilo-Code Rules Organization

## Overview
This directory contains the rules that govern the Kilo-Code system's behavior and standards. Rules are organized to optimize for both human readability and vector storage efficiency.

## File Structure
- `rules.md` - Core code quality and development standards
- `rule-test.md` - Guidelines for testing and validating rules
- `README.md` - This file explaining the organization

## Rule Structure Standards
All rule files follow a consistent structure for optimal vector storage:

### Metadata Header
```yaml
---
title: "Descriptive Title"
category: "Broad Category"
subcategory: "Specific Area"
tags: ["keyword1", "keyword2", "keyword3"]
last_updated: "YYYY-MM-DD"
applicability: "Scope of application"
confidence: "Confidence level"
---
## Extracted Insights from Prompt Collections

### Cline System Insights
1. **Structured Workflows**: Cline uses structured workflow creation with detailed steps and clear objectives
2. **PR Review Process**: Comprehensive PR review process with GitHub CLI integration and user confirmation loops
3. **Task Definition**: Emphasis on clear task objective definition and structured approaches
4. **User Interaction**: Strong focus on user feedback and confirmation throughout processes

### Kiro System Insights
1. **System Architecture**: Detailed system prompt with capabilities, rules, and platform-specific guidelines
2. **Specification-Driven Development**: Requirements → Design → Implementation planning → Execution workflow
3. **Test-Driven Development**: Emphasis on TDD and incremental progress with early testing
4. **Vector Storage Optimization**: Considerations for efficient retrieval and context management
5. **Separation of Concerns**: Clear distinction between planning/artifact creation and execution phases

### Common Patterns
1. **Metadata Headers**: Both systems use structured metadata for documentation
2. **Chunked Content**: Information organized in logical sections for efficient retrieval
3. **Cross-References**: Related concepts and rules are cross-referenced
4. **Best Practices**: Emphasis on maintainability, clarity, and actionable language
```

### Content Organization
1. **Purpose/Overview** - Clear statement of what the rule covers
2. **Principles** - High-level guiding principles
3. **Implementation** - Specific implementation details
4. **Examples** - Concrete examples where applicable
5. **Related Rules** - Cross-references to related rules

## Vector Storage Optimization
- Files are chunked by section for efficient retrieval
- Metadata provides context without loading full content
- Cross-references enable related rule discovery
- Consistent structure enables pattern-based processing

## Best Practices
- Keep rule files focused on single topics
- Use clear, actionable language
- Provide specific examples
- Maintain cross-references to related rules
- Regularly update last_updated dates
