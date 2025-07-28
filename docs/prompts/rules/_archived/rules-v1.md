# Code Quality Rules

1. General
    - Always use valid English and code syntax. Make sure NOT to use Chinese characters!
    - Slow down. Write line-by-line, pausing for IntelliSense-like corrections.
    - Catch if a task is repetitive and prefer handling programatically rather than making multple API calls.
    - Combine multiple reads into a single request to optimize calls and exuction time.
    - If you run into terminal executions that tie up the console process, "Proceed While Running" automatically.

2. Test Coverage:
    - Before attempting completion, always make sure that any code changes have test coverage
    - Ensure all tests pass before submitting changes
    - The vitest framework is used for testing; the `describe`, `test`, `it`, etc functions are defined by default in `tsconfig.json` and therefore don't need to be imported
    - Tests must be run from the same directory as the `package.json` file that specifies `vitest` in `devDependencies`
    - Run tests with: `npx vitest run <relative-path-from-workspace-root>`
    - Do NOT run tests from project root - this causes "vitest: command not found" error
    - Tests must be run from inside the correct workspace:
        - Backend tests: `cd src && npx vitest run path/to/test-file` (don't include `src/` in path)
        - UI tests: `cd webview-ui && npx vitest run src/path/to/test-file`
    - Example: For `src/tests/user.test.ts`, run `cd src && npx vitest run tests/user.test.ts` NOT `npx vitest run src/tests/user.test.ts`

3. Lint Rules:
    - *Before generating code, validate that this follows ESLint 'strict' rules and uses TypeScript 5.0+ syntax.*
    - Never disable any lint rules without explicit user approval
    - Make sure to use modern type hints and checkers to validate as you write code.

4. Styling Guidelines:
    - Use Tailwind CSS classes instead of inline style objects for new markup
    - VSCode CSS variables must be added to webview-ui/src/index.css before using them in Tailwind classes
    - Example: `<div className="text-md text-vscode-descriptionForeground mb-2" />` instead of style objects

5. Methodology
    - Ensure there are Console, Build, NPM, Jest, Strict Linting, or Unit Test errors/warnings
    - Built in Puppeteer for reading Console & Routes testing
    - Build in Playwright for Browser Automation Testing

6. New Projects:
    - Enhance the users prompt using the prompt_enhancer tool
    - For all new projects, do Deep Research first:
      - Use Chain of Thought reasoning to research all requirements and build a PLAN.md file the the users review.
      - Refactor and refine, question each constraint and requirements.
      - Ask the user to review the ./docs/PLAN.md
      - Once Approved, create the ./docs/PRD.md
      - Then create documentation:
        - Initial Docs: ./README.md (with summary, navigation to docs with short descriptions, and usage), and the rest in ./docs/ :
          ARCHETECTURE.md, CHANGELOG.md, REQUIREMENTS.md, ROADMAP.md, SESSION.md, STANDARDS.md, SYSTEM.md, TASKS.md, etc.
        - Granualary and Systematic Task breakdown: Create a ./docs/tasks folder and break down tasks into Phases (e.g. ./docs/tasks/PHASE2_TASKS.md)
        - Break down tasks into Phase, including requirements, dependencies, etc.
    - Use DevOps and SDLC best practices
    - If given two choices that meets the requirements, always choose the simplier one to impliment and maintain.

**REQUIRED APPROACH:**
1. Create a numbered task list for each issue category
2. Fix ONE issue at a time, testing after each change
3. Ensure all TypeScript types are correct with no `any` usage
4. Test each component in isolation before integration
5. Verify layout persistence works correctly
6. Run ESLint and fix all warnings

**DELIVERABLES:**
- Provide the task list first
- Show incremental fixes with code snippets
- Test and verify each fix works before moving to the next
- Ensure zero TypeScript/ESLint/Console errors
- Confirm all components render and function correctly

Start by creating the detailed task list, then proceed with the first critical issue.
