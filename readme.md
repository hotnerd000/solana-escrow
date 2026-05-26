# Solana Escrow GameFi Vault 🎮⚡

A high-performance, non-custodial GameFi Staking and Real-Time Reward system built on the Solana blockchain using **Rust (Anchor Framework 1.0.1)** and **Next.js (TypeScript & Turbopack)**. 

Players connect their **Phantom Wallet** to initialize an on-chain storage profile via a Program Derived Address (PDA), engage in an interactive clicker game client, and securely commit their gaming accomplishments directly to the Solana Devnet ledger.

---

## 🏗 System Architecture & Design

```text
    [ Phantom Wallet ] ──► [ Next.js Frontend ] ──► [ Anchor TypeScript SDK ]
                                                            │ (Devnet RPC)
                                                            ▼
                                                 [ GameFi Smart Contract ]
                                                  ├── PDA: playerState Account
                                                  └── Methods: stake_player, play_game
```

*   **Modular Architecture**: Fully separated instruction logic, modular state constraints, and an isolated `error.rs` engine.
*   **Optimal Rent Management**: Fixed-width serialization arrays minimize dynamic heap allocation costs on-chain.
*   **Automatic Garbage Collection**: Employs Anchor's native `close = player` macro constraints to deallocate accounts and cleanly refund rent lamports back to players.
*   **Low-Overhead UI Polling**: Background background polling hooks synchronize on-chain primitives smoothly with zero performance bottlenecks.

---

## 📂 Project Directory Structure

```text
solana-escrow/
├── programs/solana-escrow/     # Rust Smart Contract Context
│   ├── src/
│   │   ├── lib.rs              # Contract Module Primitives & Handlers
│   │   └── error.rs            # Custom Error Validation Enums
│   └── Cargo.toml              # Rust Dependency Manifest Sheet
├── app/                        # Next.js Web Client Layer
│   ├── src/
│   │   ├── app/                # Next.js App Router Tree (page.tsx, layout.tsx)
│   │   ├── components/         # Reusable UI Atoms (WalletButton.tsx)
│   │   ├── context/            # Global Context Stores (SolanaProvider.tsx)
│   │   ├── hooks/              # Custom Blockchain Connectors (useGameFiProgram.ts)
│   │   └── idl/                # Compiled Program Layout Map (gamefi_vault.json)
│   ├── next.config.ts          # Turbopack Compiler Engine Rules
│   └── package.json            # Node.js Package Registry Layout
├── tests/                      # Automated Test Runner Folder
│   └── solana-escrow.ts        # TypeScript Integration Testing Protocols
└── Anchor.toml                 # Global Framework Pipeline Anchors
```

---

## 🛠 Prerequisites & Installation

Ensure you have the following packages installed on your terminal workspace environment:
*   [Rust & Cargo](https://rust-lang.org) (`v1.75+`)
*   [Solana CLI Tool Suite](https://solanalabs.com) (`v3.1.x / Agave`)
*   [Anchor Framework](https://anchor-lang.com) (`v1.0.1`)
*   [Node.js & npm](https://nodejs.org) (`v20+`)

---

## 🚀 Execution & Command Roadmap

### 1. Smart Contract Pipeline
Run these execution steps from your project **root directory**:

```bash
# Clean out old build caches
anchor clean

# Build the Rust contract and generate the JSON IDL
anchor build

# Sync the fresh IDL over to your frontend client
cp target/idl/solana_escrow.json app/src/idl/gamefi_vault.json

# Execute the automated TypeScript integration test suite
anchor test
```

### 2. Network Deployment Protocol
Fund your CLI account and push the byte structure live to the **Solana Devnet Cluster**:

```bash
# Force-link your local path variables if needed
export PATH="\(HOME/.local/share/solana/install/active_release/bin:\)PATH"

# Airdrop test fuel SOL into your deployer identity wallet
solana airdrop 0.5 \$(solana address) --url devnet

# Deploy the updated bytecode up to the cluster
anchor deploy
```

### 3. Frontend Web Server
Navigate into your web module directory to spin up the Turbopack compiler:

```bash
# Move into the frontend application directory
cd app

# Clean local hidden next.js asset directory caches if needed
rm -rf .next

# Initialize the local framework development server
npm run dev
```
Open **`http://localhost:3000`** in your browser window to interact with the game.

---

## 🔒 Security Best Practices Implemented

*   **Cryptographic PDA Verification**: Uses explicit structural seed verification boundaries (`seeds = [b"player_session", player.key().as_ref()]`) to block account spoofing exploits.
*   **Integer Overflow Protection**: Every transaction calculation utilizes Rust’s `saturating_add`, `saturating_sub`, and `saturating_mul` handlers to eliminate execution exploits.
*   **State-Gated Instruction Rules**: Utilizes the `require!` checking macro paired with custom error returns to restrict unauthorized parameters.
*   **Anti-Reentrancy Closures**: Account destruction triggers instantaneous discriminator zeroing, rendering dead fields safe against injection attacks.
