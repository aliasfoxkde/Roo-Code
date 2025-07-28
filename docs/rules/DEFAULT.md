**You are a Zen Programmer**, a deep thinker and master optimizer. Your core values are **code quality, deliberate structure, and mindful planning**. Embrace these principles:

### Core Philosophy
1. **Move with Purpose**: Slow down. Take a deep breath. Tackle one problem at a time.
2. **Reason Deeply**: Use Chain-of-Thought reasoning. Build solutions from first principles using known truths.
3. **Simplify Ruthlessly**:
   - *Write minimal code*: Fewer lines = better.
   - *Prefer simplicity*: When two solutions work equally, choose the easier-to-maintain option.
   - *Avoid over-engineering*: Never add complexity without justification.

### Engineering Practices
- **Reuse Strategically**: Design functions/modules for dynamic reuse. *Goal*: Future changes require edits in *one place*.
- **Decorate Wisely**: Apply decorators for cross-cutting concerns (logging, notifications, metadata) to centralize logic.
- **Scaffold Solidly**: Build robust foundations to prevent technical debt.

### Mindset & Process
- **Research Rigorously**: Use tools (web search, docs) to validate approaches. Cross-reference multiple sources.
- **Understand Holistically**: Step back. Analyze the *entire system* before acting.
- **Decide Deliberately**: You are a machine of precision, not speed. Prioritize *fact-based, sustainable decisions* over haste.
- **Validate Thoroughly**: Fully comprehend requests/problems before implementation.

**Remember**: Less is more. Clarity beats cleverness. Structure enables scalability.


**Rules:**
- Always use valid English and code syntax. Make sure NOT to use Chinese characters!
- *Before generating code, validate that this follows ESLint 'strict' rules and uses TypeScript 5.0+ syntax.*
- Follow the tsconfig.json in this project (strict mode, moduleResolution: bundler).
- Match the .eslintrc.cjs rules from this workspace.
- Make sure to use modern type hints and checkers to validate as you write code.
- Slow down. Write line-by-line, pausing for IntelliSense-like corrections.
- Catch if a task is repetitive and prefer handling programatically rather than making multple API calls.
- Combine multiple reads into a single request to optimize calls and exuction time.
- If you run into terminal executions that tie up the console process, "Proceed While Running" automatically.

**REQUIRED APPROACH:**
1. Create a numbered task list for each issue category
2. Fix ONE issue at a time, testing after each change
3. Use FlexLayout's native APIs instead of custom implementations
4. Ensure all TypeScript types are correct with no `any` usage
5. Test each component in isolation before integration
6. Verify layout persistence works correctly
7. Run ESLint and fix all warnings

**DELIVERABLES:**
- Provide the task list first
- Show incremental fixes with code snippets
- Test and verify each fix works before moving to the next
- Ensure zero TypeScript/ESLint/Console errors
- Confirm all components render and function correctly

Start by creating the detailed task list, then proceed with the first critical issue.

**Important**: This is a critical workflow step that must be completed. Create a systematic approach to ensure you follow through on the commit/push requirement, as this has been missed in previous attempts.

If a series of requests are going to be similiar, prefer writing a script that can reduce token use and API requests over the former.


I want to be able to use open source models but one model generally does not have image, computer use, and prompt caching. So I want to be able to select multiple models for splitting up tasks to make up for this limitation and have more control. And if no "computer use" option is available, I would like to use Playwrite, Puppeteer or other integrated method (like Selenium browser or other solution OOTB). Additionally, I would like to be able to set fallback model options.

Add ability to have an orchestrator agent that manages all tasks, user interactions, voice chat, etc.

The goal is to use this system to run 24/7, splitting up tasks to multiple models (Prompt enhancement, Context Condensing, Codebase Indexing, etc.) and pack more into the context by using prompt batching (main context, then combine several questsion/answers together in one prompt, using streaming for optimal usage; the response can be used before all batches returned, edc.). Prompt batching should include a slider to choose the batch quantity but default to a safe number that should fit within the given model's context window (depending on it's size).

Priorities:
- Proxy/VPN per model
- Prompt Batching (described above) added to Settings --> Providers
- Event Triggers (custom code execution) should be added to Settings --> Prompts and provide a custom code block per action (that contains prompt, API configuration, etc.)
- Set custom rules and presets (keep same rules and presets but reduce lenghth/context and optimize them)
- Improve base prompts (refine, research, enhance and test)
- Add variables to be used in prompts (to be dynamic) with comprehensive documentation (such as $codebase_index)
- Add tool use options to prompts to make them more dynamic
- Optimize base settings

Next:
- Advanced parameters per Model config.

github vs uithub


Hivemind Improvements
- Remote Management (manage extension from mobile). Allow one so to handle multiple sessions/extensions.
- Recommended setup:
   - Sign up for Openrouter API Key (add $10)
   - Sign up for Google AI Studio (Gemma 3n 27B 128K for Prompt Enhancer/Conservator, Vision, etc. and text-embedding)
   - Hugging Face for Image Generation

Notes:
- Grab prior context and validate that steps were done.

Roo Code Improvements/Integrate:
- Documentation and Knowledge Cleanup/append
- Build in Browser automation tools (without configuration)
- Add "RAG" section to "Settings" to handle
- Improve base prompts (refine, research, enhance and test)
- Expand "Knowledge" section to:
  - Cleanup history, "ah-hah", and research into cleaned up documents.
  - Ability to add sources (news, arxiv, uithub, github, etc.)
  - Manage knowledge base, files, and cache, etc.
- Derive process for getting "clean" markdown data for KB:
  - Get README.md from Github
  - Get structure from Uithub
- Export session/task list (or continue in new chat)
- Add help documentation to each tab...
- Agents: Agents and Sub-Agent Management
- Add "Commands" to Settings: Manage Claude Commands
- Other/TBD
  - Checkpoint Manager
  - Deep Research Options
  - Manage API Keys?
  - Crash recovery
  - Spell Checking
  - Truncate, Consolidate and Summarize History.
  - Enhance/Improve openrouter error handling & timeout with options, etc.
  - Add Execution flag with # in chat window. Example: #Export, etc.
  - Fix "Proceed While Running" issues caused by commands that do not end.
  - Allow Hivemind to control Opencode from the terminal?
  - Better documentation
  - Scrum/project/planning board
- Notes: Figure out best methodology for handing project, session, or global settings.

Research
- Boomerange Tasks?
- Modes: Like "Code Reviewer"
- Task/Session recovery

Augment Features:
- Tools
  - Select default Terminal
  - Enable sound Effects
- Rules and User Guidelines
  - Create new rule file
  - Import Rules
  - User Guidelines block
- Context
  - Source Folders
  - Files
- Account
- Chat Window
  - Attachments
  - Use @ to load a file.
  - Show selected/loaded files as context
  - Auto context selected text.
- Top bar
  - Run
  - Show Edits
  - Next Edits
  - Split View
  - ... Close All, Close Saved,
- Advanced Context Engine

Kilo Code has:
- Icons in Settings instead of "..." more
- Inline Assist Options*
- Display Options*
- Enable System Notifications
- Terminal:
  - Terminal Character Limit
  - Other
- Experimental: Use "Autocomplete" feature
- Prompts:
  - Commit Message Generation*

Cline Features:
- OpenAI Reasoning Effort: Low|Medium|High
- Enable aggressive terminal reuse?

Cursor, Windsurf, etc.



App Template
- App Code (Clean: Needs strict instructions on how to code)
- Styles (TailWind CSS with rules)
- Servers
- Documentation
- Authentication
- Source Control
- Database
- Routes (including API endpoints per app, etc.)
- Framework: Python, Vite+React, NextJS
- Support
  - PWA, Cloudflare Pages/Workers, Vercel, etc.
  - GitHub integrated out of the box
- No Errors/Bugs/Warnings
  - 100% Code Coverage
  - No Console, Build, NPM, Jest, Strict Linting, or Unit Test errors/warnings
  - Built in Puppeteer for reading Console & Routes testing
  - Build in Playwright for Browser Automation Testing
