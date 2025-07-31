# Kilo-Code Standards Organization

This directory contains the standards and rules that govern the Kilo-Code system's behavior and operations. The standards are organized to optimize for both human readability and vector storage efficiency.

## Directory Structure

The standards are organized into topical directories:

- `standards/code-quality/` - Code quality rules and guidelines
- `standards/testing/` - Testing standards and guidelines
- `standards/development/` - Development workflow and practices
- `standards/documentation/` - Documentation standards and guidelines
- `standards/security/` - Security practices and guidelines

## File Structure Standards

All standard files follow a consistent structure for optimal vector storage:

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

1. **Purpose/Overview** - Clear statement of what the standard covers
2. **Principles** - High-level guiding principles
3. **Implementation** - Specific implementation details
4. **Examples** - Concrete examples where applicable
5. **Related Standards** - Cross-references to related standards

## Vector Storage Optimization

- Files are chunked by section for efficient retrieval
- Metadata provides context without loading full content
- Cross-references enable related standard discovery
- Consistent structure enables pattern-based processing

## Best Practices

- Keep standard files focused on single topics
- Use clear, actionable language
- Provide specific examples
- Maintain cross-references to related standards
- Regularly update last_updated dates