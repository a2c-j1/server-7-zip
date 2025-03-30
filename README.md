# 7-Zip

A Model Context Protocol server that compress files using **7-Zip**. 

## Components

### Tools

- **compress**
  - Compress files using **7-Zip**
  - Input:
    - `files` (array): The files to compress
    - `destination` (string): The destination path for the compressed file
    - `format` (string): The format to use for compression (required)
    - `password` (string): The password to use for encryption (optional)
  - All compressions are executed within a specified format
  - Supported formats: `zip`, `7z`, `tar`, `gzip`
  - Output: The compressed file will be saved at the specified `destination` path.

## Requirements

- [7-Zip](https://www.7-zip.org/): Please ensure 7-Zip is installed on your system. You can download it from the official website.


## Usage with Claude Desktop

To use this server with the Claude Desktop app, add the following configuration to the "mcpServers" section of your `claude_desktop_config.json`:


### NPM


1. Clone this repository to your local machine.
2. Navigate to the cloned directory in your terminal.
3. Install the required dependencies and build the project using npm:

```sh
npm install
npm run build
```

4. Add the following configuration to the "mcpServers" section of your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "7zip": {
      "command": "node",
      "args": ["/path/to/server-7-zip/build/index.js"],
      "env": {
        "7ZIP_PATH": "/path/to/7z"
      }
    },
  }
}

```


Replace `/path/to/7z` with your actual path to the 7-Zip executable. This is required for the server to function properly.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.