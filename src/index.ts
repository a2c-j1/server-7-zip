#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const SUPPORTED_FORMATS = ['zip', '7z', 'tar', 'gzip'];
const SEVEN_ZIP_PATH = process.env['7ZIP_PATH'];

if (!SEVEN_ZIP_PATH) {
  throw new Error('7ZIP_PATH environment variable is required');
}

class SevenZipServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: '7zip-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'compress',
          description: 'Compress files using 7-Zip',
          inputSchema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: { type: 'string' },
                description: 'The files to compress',
              },
              destination: {
                type: 'string',
                description: 'The destination path for the compressed file',
              },
              format: {
                type: 'string',
                description: 'The format to use for compression',
                enum: SUPPORTED_FORMATS,
              },
              password: {
                type: 'string',
                description: 'The password to use for encryption (optional)',
              },
            },
            required: ['files', 'destination', 'format'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'compress') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const { files, destination, format, password } = request.params.arguments as {
  files: string[];
  destination: string;
  format: string;
  password?: string;
};

      if (!SUPPORTED_FORMATS.includes(format)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Unsupported format: ${format}`
        );
      }

      try {
        const args = [
          'a',
          destination,
          ...files,
          `-t${format}`,
          ...(password ? [`-p${password}`] : []),
        ];

        await execFileAsync(SEVEN_ZIP_PATH!, args);

        return {
          content: [
            {
              type: 'text',
              text: `Files compressed successfully to ${destination}`,
            },
          ],
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new McpError(
            ErrorCode.InternalError,
            `7-Zip error: ${error.message}`
          );
        } else {
          throw new McpError(
            ErrorCode.InternalError,
            `7-Zip error: Unknown error occurred`
          );
        }
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('7-Zip MCP server running on stdio');
  }
}

const server = new SevenZipServer();
server.run().catch(console.error);
