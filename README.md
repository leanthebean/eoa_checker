# EVM Address Checker

A simple one-page web application that checks if an EVM address is an EOA (Externally Owned Account) or a Smart Contract, with smart wallet detection capabilities. Supports multiple networks including Ethereum, Base, Polygon, and Arbitrum.

## Features

- ✅ **EOA Detection**: Identifies regular wallet addresses controlled by private keys
- ✅ **Smart Contract Detection**: Identifies addresses containing executable code
- ✅ **Smart Wallet Detection**: Attempts to identify contract-based wallets (Gnosis Safe, Argent, etc.)
- ✅ **Balance Display**: Shows the ETH balance of the checked address
- ✅ **Multi-Network Support**: Supports Ethereum, Base, Polygon, and Arbitrum networks
- ✅ **Multiple RPC Endpoints**: Uses multiple public RPC endpoints per network for reliability
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Real-time Validation**: Validates address format before checking

## How to Use

1. Open `index.html` in your web browser
2. Select your desired network (Ethereum, Base, Polygon, or Arbitrum)
3. Enter an EVM address (42 characters starting with 0x)
4. Click "Check Address" or press Enter
5. View the results showing the address type and details

## Example Addresses for Testing

- **EOA**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (Vitalik's address)
- **Smart Contract**: `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` (UNI token contract)
- **Smart Wallet**: Try any Gnosis Safe address

## Technical Details

### How It Works

1. **Address Validation**: Checks if the input is a valid Ethereum address format
2. **Code Retrieval**: Uses `eth_getCode` RPC call to get the contract code
3. **Balance Retrieval**: Uses `eth_getBalance` RPC call to get the address balance
4. **Type Determination**:
   - **EOA**: No code present (code = "0x")
   - **Smart Contract**: Code is present
   - **Smart Wallet**: Code is present AND matches common smart wallet patterns

### Smart Wallet Detection

The application uses advanced pattern matching and bytecode analysis to detect smart wallets across all supported networks. Detection works by analyzing the contract bytecode for known smart wallet patterns and function selectors.

#### Detection Methods

**1. Bytecode Pattern Analysis:**
- **EIP-1167 Minimal Proxy**: `363d3d373d3d3d363d73` - Most common smart wallet pattern
- **EIP-1967 Proxy**: `360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` - Upgradeable proxies
- **Gnosis Safe**: `6080604052` - Multi-signature wallet initialization
- **Account Abstraction (EIP-4337)**: `3d602d80600a3d3981f3363d3d373d3d3d363d73` - Next-gen wallets

**2. Function Selector Analysis:**
- `6a761202` - execTransaction (Gnosis Safe)
- `b88d4fde` - execute (Generic wallet execution)
- `84b0196e` - EIP-1271 signature validation
- `a9059cbb` - transfer function
- Multiple wallet-specific function selectors

**3. Size-Based Heuristics:**
- Contracts 20-100 bytes are likely minimal proxies
- Larger contracts with multiple wallet functions
- Chain-specific deployment patterns

#### Chain-Specific Detection

**Ethereum**: Mature ecosystem with established patterns (Gnosis Safe, Argent, Authereum)
**Base**: Coinbase Smart Wallet patterns and Base-specific implementations
**Polygon**: Aggressive proxy detection due to low gas costs (Biconomy wallets)
**Arbitrum**: Standard EVM patterns with Arbitrum-native implementations

### RPC Endpoints

The app uses multiple public RPC endpoints for each supported network to ensure reliability:

**Ethereum:**
- `https://ethereum-rpc.publicnode.com`
- `https://rpc.ankr.com/eth`
- `https://eth.llamarpc.com`
- `https://ethereum.blockpi.network/v1/rpc/public`

**Base:**
- `https://mainnet.base.org`
- `https://base-rpc.publicnode.com`
- `https://base.llamarpc.com`
- `https://base.blockpi.network/v1/rpc/public`

**Polygon:**
- `https://polygon-rpc.com`
- `https://rpc.ankr.com/polygon`
- `https://polygon.llamarpc.com`
- `https://polygon.blockpi.network/v1/rpc/public`

**Arbitrum:**
- `https://arb1.arbitrum.io/rpc`
- `https://rpc.ankr.com/arbitrum`
- `https://arbitrum.llamarpc.com`
- `https://arbitrum.blockpi.network/v1/rpc/public`

## Files Structure

```
EOA_checker/
├── index.html      # Main HTML page
├── styles.css      # CSS styling
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Browser Requirements

- Modern web browser with JavaScript enabled
- Internet connection (for RPC calls)
- No additional dependencies required

## Detection Accuracy & Limitations

### Smart Wallet Detection Accuracy

**High Confidence Detection:**
- Gnosis Safe wallets (well-established patterns)
- EIP-1167 minimal proxy wallets
- Account Abstraction wallets (EIP-4337)

**Medium Confidence Detection:**
- Custom smart wallet implementations
- Chain-specific wallet patterns
- Proxy chains (proxy pointing to proxy)

**Potential False Positives:**
- Regular contracts with wallet-like patterns
- Token contracts with similar function selectors
- Generic proxy contracts (not necessarily wallets)

**Potential False Negatives:**
- Custom/new smart wallet implementations
- Heavily optimized or obfuscated contracts
- Novel wallet patterns not yet recognized

### System Limitations

- **RPC Dependency**: Requires working RPC endpoints
- **Mainnet Only**: Currently only supports mainnet networks (no testnet support)
- **Rate Limiting**: May be affected by RPC endpoint rate limits
- **Pattern Evolution**: Smart wallet patterns evolve rapidly, requiring updates

## Advanced Technical Details

### Detection Algorithm Flow

1. **Address Validation**: Verify EVM address format
2. **Network Selection**: Choose appropriate RPC endpoints
3. **Code Retrieval**: Fetch contract bytecode via `eth_getCode`
4. **Pattern Analysis**: Check for known smart wallet patterns
5. **Function Analysis**: Analyze function selectors
6. **Size Heuristics**: Apply size-based detection rules
7. **Confidence Scoring**: Calculate detection confidence
8. **Result Classification**: EOA, Contract, or Smart Wallet

### Supported Smart Wallet Types

- **Gnosis Safe**: Multi-signature wallets
- **Account Abstraction**: EIP-4337 compatible wallets
- **Proxy Wallets**: EIP-1167 minimal proxies
- **Upgradeable Wallets**: EIP-1967 proxy pattern
- **Coinbase Smart Wallet**: Base network specific
- **Argent Wallets**: Social recovery wallets
- **Biconomy Wallets**: Polygon-optimized wallets

## Future Enhancements

### Near-term Improvements
- Support for additional networks (BSC, Optimism, etc.)
- Testnet support for existing networks
- Enhanced smart wallet pattern database
- Factory address verification
- EIP-1271 signature validation support

### Advanced Features
- Machine learning-based detection
- Dynamic contract analysis
- Integration with web3 wallets
- Transaction history display
- Contract verification status
- ENS name resolution
- Multi-chain wallet tracking
- Community-driven pattern database

## License

This project is open source and available under the MIT License.
