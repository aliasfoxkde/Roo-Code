# Documentation Contributing Guide

This guide explains how to contribute to the Roo Code VS Code Extension documentation, including writing standards, organization principles, and submission processes.

## Documentation Philosophy

Our documentation serves two primary audiences:
1. **Human Users**: Developers, teams, and end-users seeking guidance and reference
2. **LLM Processing**: AI systems that need structured, contextual information

### Core Principles

- **Clarity First**: Write for understanding, not just completeness
- **Modular Structure**: Each document should serve a specific, focused purpose
- **Consistent Organization**: Follow established patterns and hierarchies
- **Actionable Content**: Provide practical guidance over theoretical concepts
- **Maintainable Format**: Structure content for easy updates and evolution

## Documentation Structure

### Directory Organization

```
docs/
├── user/                    # End-user documentation
│   ├── getting-started/     # Installation and first steps
│   ├── configuration/       # .roo directory and settings
│   ├── features/           # Feature guides and usage
│   ├── integration/        # Framework and tool integration
│   ├── troubleshooting/    # Problem solving and FAQ
│   └── faq.md             # Frequently asked questions
├── developer/              # Technical and contributor documentation
│   ├── architecture/       # System design and components
│   ├── api/               # API reference and examples
│   ├── contributing/      # Development and contribution guides
│   ├── extending/         # Customization and plugin development
│   └── internals/         # Deep technical implementation
├── reference/              # Complete reference materials
├── examples/               # Templates and ready-to-use configurations
├── migration/              # Upgrade and migration guides
├── legacy/                 # Preserved historical content
└── internal/               # Internal development documentation
```

### File Naming Conventions

- Use lowercase with hyphens: `getting-started.md`, `configuration-guide.md`
- Be descriptive but concise: `typescript-integration.md` not `ts.md`
- Use consistent patterns: `*-guide.md`, `*-reference.md`, `*-tutorial.md`
- Avoid version numbers in filenames (use content versioning instead)

## Writing Standards

### Markdown Format

#### Headers
```markdown
# Main Title (H1) - One per document
## Section Title (H2) - Major sections
### Subsection Title (H3) - Detailed topics
#### Detail Title (H4) - Specific points
```

#### Code Examples
```markdown
# Inline code
Use `backticks` for inline code references.

# Code blocks with language specification
```typescript
const example = "Always specify the language"
```

# File paths and commands
```bash
npm install
cd project-directory
```
```

#### Links and References
```markdown
# Internal links (relative paths)
[Configuration Guide](../configuration/roo-directory.md)

# External links
[VS Code API](https://code.visualstudio.com/api)

# Cross-references within document
See [Installation](#installation) section below.
```

### Content Structure

#### Document Template
```markdown
# Document Title

Brief description of the document's purpose and scope.

## Overview
High-level summary of the topic.

## Prerequisites (if applicable)
What users need before following this guide.

## Main Content Sections
Organized logically with clear headings.

## Examples
Practical examples and use cases.

## Troubleshooting (if applicable)
Common issues and solutions.

## Related Documentation
Links to related guides and references.

---
**Last Updated**: YYYY-MM-DD
**Related**: [Link to related docs]
```

#### Section Organization
1. **Purpose Statement**: Clear explanation of what the document covers
2. **Prerequisites**: What users need to know or have before starting
3. **Step-by-Step Content**: Logical progression of information
4. **Examples**: Practical, working examples
5. **Troubleshooting**: Common issues and solutions
6. **Cross-References**: Links to related documentation

### Writing Style

#### Tone and Voice
- **Professional but approachable**: Technical accuracy with friendly guidance
- **Active voice**: "Configure the settings" not "Settings should be configured"
- **Direct instructions**: "Click Save" not "You might want to click Save"
- **Inclusive language**: Use "they/them" for generic references

#### Technical Writing
- **Define terms**: Explain technical concepts when first introduced
- **Consistent terminology**: Use the same terms throughout all documentation
- **Specific examples**: Provide concrete examples rather than abstract descriptions
- **Error prevention**: Anticipate common mistakes and provide guidance

## Content Guidelines

### User Documentation

#### Getting Started Guides
- Assume minimal prior knowledge
- Provide step-by-step instructions
- Include screenshots or diagrams when helpful
- Test all instructions on a fresh installation

#### Configuration Documentation
- Document all available options
- Provide examples for common use cases
- Explain the impact of different settings
- Include validation and troubleshooting information

#### Feature Guides
- Focus on practical usage scenarios
- Provide complete, working examples
- Explain when and why to use features
- Include performance and security considerations

### Developer Documentation

#### API Documentation
- Document all public interfaces
- Provide complete code examples
- Include parameter types and return values
- Document error conditions and handling

#### Architecture Documentation
- Explain design decisions and rationale
- Include diagrams for complex systems
- Document component interactions
- Provide extension and customization guidance

#### Contributing Guides
- Clear setup and development instructions
- Coding standards and review processes
- Testing requirements and procedures
- Submission and review workflows

## Review and Quality Assurance

### Self-Review Checklist

Before submitting documentation:

- [ ] **Accuracy**: All information is current and correct
- [ ] **Completeness**: All necessary information is included
- [ ] **Clarity**: Instructions are clear and unambiguous
- [ ] **Examples**: Code examples work and are tested
- [ ] **Links**: All internal and external links are valid
- [ ] **Formatting**: Consistent markdown formatting
- [ ] **Grammar**: Proper spelling and grammar
- [ ] **Structure**: Logical organization and flow

### Peer Review Process

1. **Submit Pull Request**: Include clear description of changes
2. **Technical Review**: Verify accuracy and completeness
3. **Editorial Review**: Check writing quality and consistency
4. **User Testing**: Validate instructions with fresh perspective
5. **Final Approval**: Merge after all reviews pass

## Maintenance and Updates

### Regular Maintenance

- **Quarterly Reviews**: Check for outdated information
- **Link Validation**: Verify all links remain valid
- **Example Testing**: Ensure code examples still work
- **User Feedback**: Incorporate feedback and suggestions

### Version Management

- **Content Versioning**: Note when features were added or changed
- **Migration Guides**: Provide upgrade paths for breaking changes
- **Deprecation Notices**: Clear timelines for deprecated features
- **Archive Process**: Move outdated content to legacy sections

### Analytics and Improvement

- **Usage Tracking**: Monitor which documentation is most accessed
- **Feedback Collection**: Gather user feedback on documentation quality
- **Gap Analysis**: Identify missing or insufficient documentation
- **Continuous Improvement**: Regular updates based on user needs

## Tools and Resources

### Recommended Tools

- **Markdown Editor**: VS Code with markdown extensions
- **Link Checker**: Automated link validation tools
- **Grammar Check**: Grammarly or similar tools
- **Screenshot Tools**: Consistent screenshot capture and annotation

### Style Resources

- **Microsoft Writing Style Guide**: For technical writing standards
- **Markdown Guide**: For formatting reference
- **VS Code Documentation**: For consistency with VS Code patterns
- **Accessibility Guidelines**: For inclusive documentation

## Submission Process

### New Documentation

1. **Plan Structure**: Review existing documentation and identify gaps
2. **Create Outline**: Plan document structure and content
3. **Write Draft**: Follow templates and style guidelines
4. **Self-Review**: Use checklist to verify quality
5. **Submit PR**: Include clear description and rationale
6. **Address Feedback**: Respond to review comments
7. **Final Review**: Ensure all requirements are met

### Updates and Corrections

1. **Identify Issue**: Document the problem or improvement needed
2. **Research Solution**: Verify correct information or approach
3. **Make Changes**: Update content following style guidelines
4. **Test Changes**: Verify examples and instructions work
5. **Submit PR**: Include description of changes and rationale

---

**Version**: 1.0  
**Last Updated**: January 28, 2024  
**Status**: Active Guidelines

*These guidelines ensure consistent, high-quality documentation that serves both human users and AI processing needs effectively.*
