# Kilo-Code Rules Organization

## Overview
This directory contains the rules that govern the Kilo-Code system's behavior and standards. Rules are organized to optimize for both human readability and vector storage efficiency.

## Directory Structure

### Standards
- `standards/code-quality/` - Core code quality and development standards
- `standards/testing/` - Testing guidelines and validation procedures

### Tools
- `tools/code-editors/` - Editor-specific configurations and best practices

### Docs
- `docs/` - Documentation and organizational guidelines

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
