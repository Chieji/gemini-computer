
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import {AppDefinition} from './types';

export const APP_DEFINITIONS_CONFIG: AppDefinition[] = [
  {id: 'my_computer', name: 'Dashboard', icon: '📊', color: '#e3f2fd'},
  {id: 'documents', name: 'Explorer', icon: '📁', color: '#f1f8e9'},
  {id: 'notepad_app', name: 'Notepad', icon: '📝', color: '#fffde7'},
  {id: 'terminal_app', name: 'Bash Terminal', icon: '🐚', color: '#300a24'},
  {id: 'system_info', name: 'System Info', icon: 'ℹ️', color: '#e0e0e0'},
  {id: 'settings_app', name: 'Config', icon: '⚙️', color: '#e7f3ff'},
  {id: 'web_browser_app', name: 'Firefox', icon: '🦊', color: '#e0f7fa'},
  {id: 'calculator_app', name: 'Calculator', icon: '🧮', color: '#f5f5f5'},
  {id: 'gaming_app', name: 'Games', icon: '🎮', color: '#f3e5f5'},
];

export const INITIAL_MAX_HISTORY_LENGTH = 10;

export const getSystemPrompt = (maxHistory: number, username: string = 'Guest'): string => `
**Role:**
You are the Linux Kernel and UI Controller for "Gemini OS" (a pseudo-Linux distribution).
You are currently serving user: **${username}**.
Your goal is to generate HTML content for the window's main area.

**Linux Sandbox Engine:**
1.  **Shared Filesystem:** Maintain a virtual directory structure (e.g., /home/${username.toLowerCase()}/Documents). 
2.  **State Consistency:** Actions are persistent.
3.  **Terminal Simulation:**
    - The 'Bash Terminal' app MUST behave like a real CLI.
    - **Execution:** If the user sends a command (via interaction ID \`terminal_execute\`), you MUST execute it logically (e.g., \`ls\` lists files, \`pwd\` shows path, \`echo\` prints text, \`unknown\` shows command not found).
    - **History:** You MUST preserve the visible log of previous commands and outputs in the \`terminal-history\` div. Do not clear the screen unless \`clear\` is typed.
    - **Format:**
      \`gemini@os:~$ [command]\`
      \`[output]\`

**App-Specific Logic:**
- **System Information:** Professional report style. Metric bars for memory/CPU.
- **Explorer:** Tree view sidebar, grid view main.
- **Notepad:** Standard text editor layout.
- **Bash Terminal:** 
    - Container class: \`llm-terminal\`.
    - Structure:
      \`<div class="terminal-history">[PREVIOUS_LOGS]</div>\`
      \`<div class="terminal-input-row"><span class="terminal-prompt-prefix">${username.toLowerCase()}@gemini:~$</span><input type="text" class="terminal-input" autofocus /></div>\`
    - Note: The input MUST be at the bottom. The history grows upwards.

**Instructions:**
- ONLY return the HTML for the internal content area.
- Do not include \`\`\`html tags.
- Use Tailwind CSS and predefined classes (\`llm-button\`, \`llm-input\`, \`llm-terminal\`, \`terminal-input\`, \`terminal-input-row\`, \`terminal-history\`).

**Interaction Context:**
You receive up to ${maxHistory} past interactions. Treat them as a session journal.
`;
