import { spawn } from 'node:child_process';

async function resolveChromiumBinary() {
  try {
    const { default: chromium } = await import('@sparticuz/chrome-aws-lambda');
    process.env.AWS_LAMBDA_FUNCTION_NAME ??= 'karma-tests';
    const executablePath = await chromium.executablePath;

    if (!executablePath) {
      throw new Error('chrome-aws-lambda returned an empty executable path.');
    }

    process.env.CHROME_BIN = executablePath;
    const chromiumFlags = [...chromium.args, '--no-sandbox', '--disable-dev-shm-usage'];
    process.env.CHROME_FLAGS = chromiumFlags.join(' ');

    if (chromium.defaultViewport) {
      process.env.CHROME_FLAGS += ` --window-size=${chromium.defaultViewport.width},${chromium.defaultViewport.height}`;
    }

    if (chromium.libraryPath) {
      const libraryPath = Array.isArray(chromium.libraryPath)
        ? chromium.libraryPath.join(':')
        : chromium.libraryPath;
      process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
        ? `${process.env.LD_LIBRARY_PATH}:${libraryPath}`
        : libraryPath;
    }
  } catch (error) {
    console.warn('Unable to resolve the chrome-aws-lambda Chromium binary.', error);
  }
}

await resolveChromiumBinary();

const args = process.argv.slice(2);

if (!args.some((arg) => arg.startsWith('--browsers'))) {
  args.push('--browsers=ChromeHeadlessNoSandbox');
}

if (!args.some((arg) => arg.startsWith('--watch'))) {
  args.push('--watch=false');
}

const child = spawn('ng', ['test', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
