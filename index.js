#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

class ChessFENServer {
  constructor() {
    this.server = new Server(
      {
        name: "chess-fen-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "visualize_fen",
            description: "Convert FEN notation to ASCII chess board visualization",
            inputSchema: {
              type: "object",
              properties: {
                fen_string: {
                  type: "string",
                  description: "FEN (Forsyth-Edwards Notation) string representing chess position",
                },
              },
              required: ["fen_string"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "visualize_fen":
          return this.handleVisualizeFEN(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async handleVisualizeFEN(args) {
    const { fen_string } = args;
    const fen = fen_string;
    
    if (!fen || typeof fen !== "string") {
      throw new McpError(
        ErrorCode.InvalidParams,
        "FEN string is required"
      );
    }

    try {
      const visualization = this.fenToAscii(fen);
      return {
        content: [
          {
            type: "text",
            text: visualization,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Error visualizing FEN: ${error.message}`
      );
    }
  }

  fenToAscii(fen) {
    try {
      const parsedFen = this.parseFenString(fen);
      return this.renderBoard(parsedFen);
    } catch (error) {
      throw new Error(`Invalid FEN: ${error.message}`);
    }
  }

  parseFenString(fen) {
    const fenTokens = fen.trim().split(" ");
    if (fenTokens.length !== 6) {
      throw new Error("FEN must have exactly 6 fields");
    }

    return {
      board: this.parseBoard(fenTokens[0]),
      toMove: fenTokens[1] === "w" ? "white" : "black",
      castlingRights: this.parseCastlingRights(fenTokens[2]),
      enPassantSquare: fenTokens[3],
      halfMoves: parseInt(fenTokens[4], 10),
      fullMoves: parseInt(fenTokens[5], 10),
    };
  }

  parseBoard(boardString) {
    const rows = boardString.split("/");
    if (rows.length !== 8) {
      throw new Error("Board must have exactly 8 rows");
    }

    return rows.map((row) => {
      const squares = [];
      for (let i = 0; i < row.length; i++) {
        const char = row.charAt(i);
        if (char.match(/\d/)) {
          const emptySquares = parseInt(char, 10);
          for (let j = 0; j < emptySquares; j++) {
            squares.push(" ");
          }
        } else if (this.isPiece(char)) {
          squares.push(char);
        } else {
          throw new Error(`Invalid character in board: ${char}`);
        }
      }
      if (squares.length !== 8) {
        throw new Error("Each row must have exactly 8 squares");
      }
      return squares;
    });
  }

  parseCastlingRights(castlingString) {
    return {
      white: {
        queenside: castlingString.includes("Q"),
        kingside: castlingString.includes("K"),
      },
      black: {
        queenside: castlingString.includes("q"),
        kingside: castlingString.includes("k"),
      },
    };
  }

  isPiece(char) {
    return /^[pnbrqkPNBRQK]$/.test(char);
  }

  pieceToUnicode(piece) {
    const pieceMap = {
      // White pieces
      P: "♙", // Pawn
      N: "♘", // Knight
      B: "♗", // Bishop
      R: "♖", // Rook
      Q: "♕", // Queen
      K: "♔", // King
      // Black pieces
      p: "♟", // Pawn
      n: "♞", // Knight
      b: "♝", // Bishop
      r: "♜", // Rook
      q: "♛", // Queen
      k: "♚", // King
    };
    return pieceMap[piece] || ".";
  }

  renderBoard(parsedFen) {
    const { board, toMove, castlingRights, enPassantSquare, halfMoves, fullMoves } = parsedFen;
    
    // First output the structured data
    let result = `Fen {\n`;
    result += `  rows: 8,\n`;
    result += `  columns: 8,\n`;
    result += `  board: [\n`;
    result += `  a b c d e f g h\n`;
    
    for (let row = 0; row < 8; row++) {
      const rankNumber = 8 - row;
      result += `${rankNumber} `;
      
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        const display = piece === " " ? "." : this.pieceToUnicode(piece);
        result += `${display} `;
      }
      
      result += `${rankNumber}\n`;
    }
    
    result += `  a b c d e f g h\n`;
    result += `  ],\n`;
    result += `  toMove: '${toMove}',\n`;
    result += `  castlingRights: {\n`;
    result += `    white: { queenside: ${castlingRights.white.queenside}, kingside: ${castlingRights.white.kingside} },\n`;
    result += `    black: { queenside: ${castlingRights.black.queenside}, kingside: ${castlingRights.black.kingside} }\n`;
    result += `  },\n`;
    result += `  enPassantSquare: '${enPassantSquare}',\n`;
    result += `  halfMoves: ${halfMoves},\n`;
    result += `  fullMoves: ${fullMoves}\n`;
    result += `}`;
    
    return result;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Chess FEN MCP server running on stdio");
  }
}

const server = new ChessFENServer();
server.run().catch(console.error);