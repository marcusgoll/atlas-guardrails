import { Command } from 'commander';
import { AtlasIndexer } from '../core/indexer';
import { AtlasPacker } from '../core/packer';
import { AtlasGuardrails } from '../core/guardrails';
import { RalphyIntegration } from '../core/ralphy';

const BANNER = `
\x1b[36m
      ___           ___           ___           ___           ___     
     /\  \         /\  \         /\__\         /\  \         /\  \    
    /::\  \        \:\  \       /:/  /        /::\  \       /::\  \   
   /:/\:\  \        \:\  \     /:/  /        /:/\:\  \     /:/\ \  \  
  /::\~\:\  \       /::\  \   /:/  /        /::\~\:\  \   _\:\~\ \  \ 
 /:/\:\ \:\__\     /:/\:\__\ /:/__/        /:/\:\ \:\__\ /\ \:\ \ \__\
 \/__\:\/:/  /    /:/  \/__/ \:\  \        \/__\:\/:/  / \:\ \:\ \/__/
      \::/  /    /:/  /       \:\  \            \::/  /   \:\ \:\__\  
      /:/  /    /:/  /         \:\  \           /:/  /     \:\/:/  /  
     /:/  /    /:/  /           \:\__\         /:/  /       \::/  /   
     \/__/     \/__/             \/__/         \/__/         \/__/    
\x1b[0m
   \x1b[1mATLAS GUARDRAILS\x1b[0m - \x1b[2mStop the Entropy\x1b[0m
`;

const program = new Command();

program
  .name('atlas')
  .description(BANNER + '\nAtlas Guardrails CLI')
  .version('1.0.2')
  .configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => process.stdout.write(str),
    outputError: (str, write) => write('\x1b[31m' + str + '\x1b[0m')
  });

program.command('index')
  .description('Index the repository')
  .action(async () => {
    const indexer = new AtlasIndexer(process.cwd());
    await indexer.index();
  });

program
  .command('pack')
  .description('Create a context pack for a task')
  .requiredOption('-t, --task <string>', 'Task description')
  .option('-b, --budget <number>', 'Token budget', '50000')
  .action((options) => {
    const packer = new AtlasPacker(process.cwd());
    const pack = packer.pack({
      task: options.task,
      budget: parseInt(options.budget),
      mode: 'feature',
    });
    console.log(`Packed ${pack.files.length} files into pack.json`);
  });

program
  .command('find-duplicates')
  .description('Find potential duplicates')
  .option('-i, --intent <string>', 'Intent description')
  .action((options) => {
    const guard = new AtlasGuardrails(process.cwd());
    const results = guard.findDuplicates(options.intent || '');
    console.log(JSON.stringify(results, null, 2));
  });

program
  .command('check')
  .description('Run drift and policy checks')
  .action(async () => {
    const guard = new AtlasGuardrails(process.cwd());
    const result = await guard.checkDrift();
    if (result.status === 'fail') {
      console.error(`Check failed: ${result.reason}`);
      process.exit(1);
    } else {
      console.log('Checks passed.');
    }
  });

program
  .command('ralphy-init')
  .description('Initialize Ralphy configuration')
  .action(() => {
    RalphyIntegration.init(process.cwd());
  });

program
  .command('mcp')
  .description('Start the MCP server (stdio)')
  .action(async () => {
    // Dynamic import to run the server
    await import('../mcp/server');
  });

export { program };
