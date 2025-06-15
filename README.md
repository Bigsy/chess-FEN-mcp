# Chess FEN MCP Server

A Model Context Protocol (MCP) server that provides chess FEN notation validation and visualization capabilities.

## Features

- Convert FEN (Forsyth-Edwards Notation) strings to ASCII chess board visualizations
- Easy integration with MCP-compatible AI assistants allowing them to validate their generated FEN strings
- Installable via npx

## Installation

```bash
npx chess-fen-mcp
```

Or install globally:

```bash
npm install -g chess-fen-mcp
```

## Usage

### As MCP Server

Add to your MCP client configuration (Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "chess-fen": {
      "command": "npx",
      "args": ["chess-fen-mcp"]
    }
  }
}
```

If installed globally, you can also use:

```json
{
  "mcpServers": {
    "chess-fen": {
      "command": "chess-fen-mcp"
    }
  }
}
```

### Available Tools

#### `visualize_fen`

Converts a FEN string to an ASCII chess board visualization.

**Parameters:**
- `fen_string` (string, required): FEN notation string

**Example Input:**
```
fen_string: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
```

**Example Output:**
```
Fen {
  rows: 8,
  columns: 8,
  board: [
  a b c d e f g h
8 ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜ 8
7 ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ 7
6 . . . . . . . . 6
5 . . . . . . . . 5
4 . . . . . . . . 4
3 . . . . . . . . 3
2 ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙ 2
1 ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖ 1
  a b c d e f g h
  ],
  toMove: 'white',
  castlingRights: {
    white: { queenside: true, kingside: true },
    black: { queenside: true, kingside: true }
  },
  enPassantSquare: '-',
  halfMoves: 0,
  fullMoves: 1
}
```

## Development

```bash
git clone
cd chess-fen-mcp
npm install
npm run dev
```

## License

MIT
