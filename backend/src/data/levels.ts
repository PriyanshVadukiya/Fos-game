import { Level } from '../types';

export const levels: Level[] = [
  // ─────────────────────────────────────────────────────────────────────
  // LEVEL 1 – cat file.txt in Terminal (Beginner)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'cat-file',
    title: 'Run `cat file.txt`',
    appName: 'Terminal Shell',
    appIcon: 'Terminal',
    difficulty: 'beginner',
    scenario: 'You type `cat file.txt` and press Enter in your terminal.',
    description:
      'The shell interprets your command, opens the file, reads its contents, writes them to stdout (fd 1), then closes the file descriptor. This is the foundational read-display loop used by almost every CLI tool.',
    availableSyscalls: ['open', 'read', 'write', 'close', 'fork', 'exec', 'stat', 'unlink'],
    correctSequence: [
      {
        syscall: 'open',
        description: 'Opens "file.txt" and obtains a file descriptor.',
        microDescription: 'open("file.txt", O_RDONLY) → fd 3  |  The kernel searches the filesystem, checks permissions, and hands back an integer handle (fd 3) pointing to the file\'s inode.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
            { fd: 3, file: 'file.txt', mode: 'r' },
          ],
          diskActivity: { path: '/home/user/file.txt', operation: 'open' },
        },
        durationMs: 800,
      },
      {
        syscall: 'read',
        description: 'Reads the file contents into a buffer in memory.',
        microDescription: 'read(fd=3, buf, 4096) → n bytes  |  The kernel copies data from the page cache (or disk) into the process\'s user-space buffer. Returns the number of bytes actually read.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
            { fd: 3, file: 'file.txt', mode: 'r' },
          ],
          diskActivity: { path: '/home/user/file.txt', operation: 'read' },
          memoryActivity: { segment: 'heap buffer', operation: 'alloc' },
        },
        durationMs: 700,
      },
      {
        syscall: 'write',
        description: 'Writes the buffer contents to stdout (your terminal).',
        microDescription: 'write(fd=1, buf, n) → n  |  The kernel copies data from the user-space buffer to the stdout file descriptor, which the terminal driver renders as visible characters on screen.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
            { fd: 3, file: 'file.txt', mode: 'r' },
          ],
          diskActivity: null,
          memoryActivity: null,
        },
        durationMs: 600,
      },
      {
        syscall: 'close',
        description: 'Releases the file descriptor, freeing the kernel resource.',
        microDescription: 'close(fd=3) → 0  |  The kernel removes fd 3 from the process\'s file descriptor table. Any internal kernel buffers for this file are flushed, and the reference count on the inode is decremented.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
          ],
          diskActivity: { path: '/home/user/file.txt', operation: 'close' },
        },
        durationMs: 500,
      },
    ],
    hints: [
      'Think about the lifecycle: you need a handle before you can use a file.',
      'Closing a file is good hygiene — the kernel has limited file descriptors.',
      'stdout is just fd 1, a special pre-opened file descriptor.',
    ],
    successMessage:
      'Perfect! You mapped the exact four-syscall sequence that every `cat`-like tool uses under the hood.',
    failureMessage:
      'Close, but not quite. Remember: you must open() before you can read(), and you should always close() when done to release the file descriptor.',
  },

  // ─────────────────────────────────────────────────────────────────────
  // LEVEL 2 – Save a document in VS Code (Intermediate)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'save-vscode',
    title: 'Save a File in VS Code',
    appName: 'VS Code',
    appIcon: 'Code2',
    difficulty: 'intermediate',
    scenario: 'You press Ctrl+S to save "main.ts" in VS Code.',
    description:
      'VS Code performs a safe atomic save: it opens the target file for writing, writes the new content, then closes it. Many editors also call stat() first to check the existing file metadata before overwriting.',
    availableSyscalls: ['open', 'read', 'write', 'close', 'stat', 'fork', 'exec', 'unlink'],
    correctSequence: [
      {
        syscall: 'stat',
        description: 'Checks the current metadata of "main.ts" before overwriting.',
        microDescription: 'stat("main.ts", &statbuf) → 0  |  The kernel fills a stat struct with inode number, file size, permissions, and timestamps. VS Code uses this to detect external changes and check write permission.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
          ],
          diskActivity: { path: '/workspace/main.ts', operation: 'read' },
        },
        durationMs: 500,
      },
      {
        syscall: 'open',
        description: 'Opens "main.ts" with write and truncate flags to prepare for saving.',
        microDescription: 'open("main.ts", O_WRONLY|O_TRUNC|O_CREAT, 0644) → fd 7  |  O_TRUNC zeroes the existing file length instantly. The kernel returns fd 7 pointing to the now-empty inode, ready for new content.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
            { fd: 7, file: 'main.ts', mode: 'w' },
          ],
          diskActivity: { path: '/workspace/main.ts', operation: 'open' },
        },
        durationMs: 700,
      },
      {
        syscall: 'write',
        description: 'Writes the new file contents from the editor buffer to disk.',
        microDescription: 'write(fd=7, buf, len) → len  |  The kernel copies the entire editor buffer into the page cache mapped to the file\'s inode blocks. The OS will flush dirty pages to physical disk asynchronously (or immediately with O_SYNC).',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
            { fd: 7, file: 'main.ts', mode: 'w' },
          ],
          diskActivity: { path: '/workspace/main.ts', operation: 'write' },
          memoryActivity: { segment: 'page cache', operation: 'alloc' },
        },
        durationMs: 800,
      },
      {
        syscall: 'close',
        description: 'Closes the file descriptor, flushing pending writes.',
        microDescription: 'close(fd=7) → 0  |  The kernel removes fd 7 from the process table, flushes any remaining buffered writes to the page cache, and decrements the inode reference count. The file is now durably saved.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 0, file: 'stdin', mode: 'r' },
            { fd: 1, file: 'stdout', mode: 'w' },
            { fd: 2, file: 'stderr', mode: 'w' },
          ],
          diskActivity: { path: '/workspace/main.ts', operation: 'close' },
        },
        durationMs: 500,
      },
    ],
    hints: [
      'Editors often inspect the file metadata first — they want to know if someone else edited it.',
      'Opening with O_TRUNC clears the old content before writing new content.',
      'The sequence ends when the file descriptor is released.',
    ],
    successMessage:
      'Excellent! You nailed the editor save flow: stat → open → write → close is exactly how VS Code and most editors persist files safely.',
    failureMessage:
      'Not quite. VS Code checks file metadata with stat() before opening for write. Try starting with stat(), then open() with write flags, write(), and close().',
  },

  // ─────────────────────────────────────────────────────────────────────
  // LEVEL 3 – Launch a program (fork + exec) (Intermediate)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'launch-program',
    title: 'Launch a New Program',
    appName: 'Bash Shell',
    appIcon: 'Terminal',
    difficulty: 'intermediate',
    scenario: 'You type `./myapp` and press Enter — the shell launches the program.',
    description:
      'Every program launch on Unix follows the fork-exec pattern. The parent shell clones itself via fork(), then the child process replaces its memory image with the new program via exec(). The parent calls wait() to reap the child when it exits.',
    availableSyscalls: ['fork', 'exec', 'wait', 'open', 'read', 'write', 'close', 'exit', 'stat'],
    correctSequence: [
      {
        syscall: 'fork',
        description: 'Shell clones itself, creating a child process.',
        microDescription: 'fork() → 0 (child) / child_pid (parent)  |  The kernel duplicates the shell\'s page tables using copy-on-write semantics. Two processes now exist: the parent shell and an identical child, both resuming after the fork() call.',
        kernelEffect: {
          processTable: [
            { pid: 1001, state: 'running', name: 'bash (parent)' },
            { pid: 1002, state: 'running', name: 'bash (child)' },
          ],
          memoryActivity: { segment: 'process address space', operation: 'alloc' },
        },
        durationMs: 900,
      },
      {
        syscall: 'exec',
        description: 'Child replaces its memory image with "myapp" binary.',
        microDescription: 'execve("./myapp", argv, envp) → (no return on success)  |  The kernel loads the ELF binary\'s segments into the child\'s address space, sets up the stack with argv/envp, and transfers control to the entry point. The child is now myapp.',
        kernelEffect: {
          processTable: [
            { pid: 1001, state: 'waiting', name: 'bash (parent)' },
            { pid: 1002, state: 'running', name: 'myapp' },
          ],
          diskActivity: { path: './myapp', operation: 'read' },
          memoryActivity: { segment: 'text+data+stack', operation: 'exec' },
        },
        durationMs: 1000,
      },
      {
        syscall: 'wait',
        description: 'Parent shell suspends, waiting for the child to finish.',
        microDescription: 'wait(&status) → child_pid  |  The parent shell calls into the kernel\'s wait subsystem and is put to sleep. When myapp eventually calls exit(), the kernel wakes the parent and delivers the exit status via the status pointer.',
        kernelEffect: {
          processTable: [
            { pid: 1001, state: 'sleeping (wait)', name: 'bash (parent)' },
            { pid: 1002, state: 'running', name: 'myapp' },
          ],
        },
        durationMs: 800,
      },
      {
        syscall: 'exit',
        description: 'Child process terminates, notifying the parent.',
        microDescription: 'exit(0)  |  myapp calls the C runtime which invokes the exit() syscall. The kernel marks the process as a zombie, releases most resources, and sends SIGCHLD to the parent, unblocking its wait() call.',
        kernelEffect: {
          processTable: [
            { pid: 1001, state: 'running', name: 'bash (parent)' },
            { pid: 1002, state: 'zombie → reaped', name: 'myapp' },
          ],
          memoryActivity: { segment: 'process address space', operation: 'free' },
        },
        durationMs: 700,
      },
    ],
    hints: [
      'On Unix, new processes are always born from existing ones — fork first!',
      'exec() does not create a new process; it replaces the current one.',
      'The parent shell needs to wait() so the zombie child is properly cleaned up.',
    ],
    successMessage:
      'Brilliant! fork → exec → wait → exit is the heartbeat of Unix process creation. Every `npm install`, `python script.py`, and shell command follows this exact pattern.',
    failureMessage:
      'Almost there. Remember: fork() clones the parent first, then exec() transforms the child. The parent waits for the child, and finally the child calls exit() to terminate.',
  },

  // ─────────────────────────────────────────────────────────────────────
  // LEVEL 4 – Pipe: ls | grep .ts  (Advanced)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'pipe-ls-grep',
    title: 'Run `ls | grep .ts`',
    appName: 'Terminal (Pipe)',
    appIcon: 'GitBranch',
    difficulty: 'advanced',
    scenario: 'You run `ls | grep .ts` — two programs connected by a pipe.',
    description:
      'A shell pipe creates an anonymous pipe buffer in the kernel, forks twice, and uses dup2() to rewire the stdout of ls into the stdin of grep. This is the "telephone game" of Unix — data passes through the kernel without touching disk.',
    availableSyscalls: ['pipe', 'fork', 'dup2', 'exec', 'close', 'read', 'write', 'wait', 'exit'],
    correctSequence: [
      {
        syscall: 'pipe',
        description: 'Creates a kernel pipe with two file descriptors: read-end and write-end.',
        microDescription: 'pipe(pipefd[2]) → 0  |  The kernel allocates a 64KB circular buffer in kernel memory and returns two fds: pipefd[0] (read) and pipefd[1] (write). Data written to pipefd[1] can be read from pipefd[0].',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 3, file: 'pipe:read-end', mode: 'r' },
            { fd: 4, file: 'pipe:write-end', mode: 'w' },
          ],
          pipeActivity: { from: 4, to: 3 },
        },
        durationMs: 700,
      },
      {
        syscall: 'fork',
        description: 'Shell forks to create the ls child process.',
        microDescription: 'fork() → child_pid  |  The parent shell duplicates itself. Both parent and child inherit pipefd[0] and pipefd[1]. The child will become `ls`, the parent will fork again for `grep`.',
        kernelEffect: {
          processTable: [
            { pid: 2000, state: 'running', name: 'bash (parent)' },
            { pid: 2001, state: 'running', name: 'bash (child→ls)' },
          ],
          pipeActivity: { from: 4, to: 3 },
        },
        durationMs: 800,
      },
      {
        syscall: 'dup2',
        description: 'ls child rewires its stdout (fd 1) to the pipe write-end (fd 4).',
        microDescription: 'dup2(pipefd[1], STDOUT_FILENO) → 1  |  The kernel makes fd 1 (stdout) an alias for fd 4 (pipe write-end). Any write to stdout now goes into the pipe buffer instead of the terminal.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 1, file: 'pipe:write-end', mode: 'w' },
            { fd: 3, file: 'pipe:read-end', mode: 'r' },
            { fd: 4, file: 'pipe:write-end', mode: 'w' },
          ],
          pipeActivity: { from: 1, to: 3 },
        },
        durationMs: 600,
      },
      {
        syscall: 'exec',
        description: 'Child executes the `ls` binary, inheriting the rewired stdout.',
        microDescription: 'execve("/bin/ls", argv, envp)  |  ls replaces the child\'s address space. It writes its directory listing to fd 1 (which is now the pipe write-end), pumping data into the kernel pipe buffer.',
        kernelEffect: {
          processTable: [
            { pid: 2000, state: 'running', name: 'bash (parent)' },
            { pid: 2001, state: 'running', name: 'ls' },
          ],
          diskActivity: { path: '/bin/ls', operation: 'read' },
        },
        durationMs: 900,
      },
      {
        syscall: 'close',
        description: 'Close unused pipe ends so EOF is correctly signaled.',
        microDescription: 'close(pipefd[1]) in parent  |  If the parent holds the write-end open, grep would block forever waiting for more input. Closing it ensures grep gets EOF when ls finishes.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 1, file: 'stdout (terminal)', mode: 'w' },
            { fd: 3, file: 'pipe:read-end', mode: 'r' },
          ],
          pipeActivity: { from: 4, to: 3 },
        },
        durationMs: 500,
      },
      {
        syscall: 'wait',
        description: 'Shell waits for both child processes to finish.',
        microDescription: 'wait(&status) × 2  |  The parent calls wait() once for ls and once for grep. The kernel suspends the parent until each child exits, then returns their PIDs and exit codes.',
        kernelEffect: {
          processTable: [
            { pid: 2000, state: 'waiting', name: 'bash (parent)' },
            { pid: 2001, state: 'exited', name: 'ls' },
            { pid: 2002, state: 'running', name: 'grep' },
          ],
        },
        durationMs: 800,
      },
    ],
    hints: [
      'The pipe must be created BEFORE forking — children inherit file descriptors.',
      'dup2 is the secret: it rewires file descriptors without changing what the program writes to.',
      'Forgetting to close the write-end in the parent will hang grep forever.',
    ],
    successMessage:
      'Outstanding! You mapped the full Unix pipe: pipe → fork → dup2 → exec → close → wait. This is how every shell pipeline, including Docker, CI/CD, and build tools, works under the hood.',
    failureMessage:
      'Pipes are tricky. The key insight: create the pipe first, then fork so both children inherit the fds, then use dup2 to rewire stdout/stdin before exec.',
  },

  // ─────────────────────────────────────────────────────────────────────
  // LEVEL 5 – Open a file in Chrome (Advanced)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'chrome-open-tab',
    title: 'Chrome Opens a Local HTML File',
    appName: 'Google Chrome',
    appIcon: 'Globe',
    difficulty: 'advanced',
    scenario: 'You drag "index.html" into Chrome — it opens the file in a new tab.',
    description:
      'Chrome first stats the file to verify it exists and check its type, then opens it for reading, reads the HTML content into memory, closes the file descriptor, and then its rendering engine processes it. Chrome\'s multi-process architecture means a new renderer process is forked for each tab.',
    availableSyscalls: ['stat', 'open', 'read', 'close', 'fork', 'exec', 'write', 'mmap'],
    correctSequence: [
      {
        syscall: 'stat',
        description: 'Chrome checks file metadata — does it exist? Is it readable?',
        microDescription: 'stat("index.html", &buf) → 0  |  The kernel fills the stat buffer with the file\'s size, MIME-hintable extension, permissions, and inode. Chrome uses this to decide which renderer to use and whether to proceed.',
        kernelEffect: {
          diskActivity: { path: '/home/user/index.html', operation: 'read' },
        },
        durationMs: 500,
      },
      {
        syscall: 'open',
        description: 'Opens "index.html" for reading.',
        microDescription: 'open("index.html", O_RDONLY) → fd 12  |  The kernel verifies read permission against the file\'s ACL and the process\'s UID/GID. On success, fd 12 is added to the process\'s file descriptor table.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 12, file: 'index.html', mode: 'r' },
          ],
          diskActivity: { path: '/home/user/index.html', operation: 'open' },
        },
        durationMs: 700,
      },
      {
        syscall: 'read',
        description: 'Reads the HTML source into Chrome\'s memory buffer.',
        microDescription: 'read(fd=12, buf, size) → n  |  The kernel triggers a page fault if the page isn\'t cached, fetches it from disk via the block device driver, copies it to user space. Chrome\'s I/O thread receives the raw HTML bytes.',
        kernelEffect: {
          fileDescriptorTable: [
            { fd: 12, file: 'index.html', mode: 'r' },
          ],
          diskActivity: { path: '/home/user/index.html', operation: 'read' },
          memoryActivity: { segment: 'I/O buffer', operation: 'alloc' },
        },
        durationMs: 800,
      },
      {
        syscall: 'close',
        description: 'Closes the file descriptor — the HTML is now in memory.',
        microDescription: 'close(fd=12) → 0  |  Chrome no longer needs the file handle. The kernel decrements the inode\'s open count. The HTML bytes remain in Chrome\'s heap for the renderer.',
        kernelEffect: {
          fileDescriptorTable: [],
          diskActivity: { path: '/home/user/index.html', operation: 'close' },
        },
        durationMs: 500,
      },
      {
        syscall: 'fork',
        description: 'Chrome\'s browser process forks a new renderer process for the tab.',
        microDescription: 'fork() → renderer_pid  |  Chrome\'s multi-process model isolates each tab in its own sandboxed process for security. The browser process forks, and the child will become the renderer (via exec of the chrome binary with renderer flags).',
        kernelEffect: {
          processTable: [
            { pid: 3000, state: 'running', name: 'chrome (browser)' },
            { pid: 3001, state: 'running', name: 'chrome (renderer)' },
          ],
          memoryActivity: { segment: 'renderer address space', operation: 'alloc' },
        },
        durationMs: 900,
      },
    ],
    hints: [
      'Chrome is cautious — it checks file metadata before attempting to open.',
      'Read happens before close: you can\'t close what you haven\'t finished reading.',
      'Chrome\'s tab isolation requires forking a new process per tab.',
    ],
    successMessage:
      'Superb! stat → open → read → close → fork maps Chrome\'s file-open pipeline. The fork at the end is what gives each Chrome tab its own crash-isolated process.',
    failureMessage:
      'Almost. Chrome validates the file first (stat), then opens, reads, closes, and finally forks a renderer subprocess. Make sure stat comes before open.',
  },
];
