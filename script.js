class EVMAddressChecker {
    constructor() {
        this.chains = {
            ethereum: {
                name: 'Ethereum',
                rpcEndpoints: [
                    'https://ethereum-rpc.publicnode.com',
                    'https://rpc.ankr.com/eth',
                    'https://eth.llamarpc.com',
                    'https://ethereum.blockpi.network/v1/rpc/public'
                ],
                currency: 'ETH'
            },
            base: {
                name: 'Base',
                rpcEndpoints: [
                    'https://mainnet.base.org',
                    'https://base-rpc.publicnode.com',
                    'https://base.llamarpc.com',
                    'https://base.blockpi.network/v1/rpc/public'
                ],
                currency: 'ETH'
            },
            polygon: {
                name: 'Polygon',
                rpcEndpoints: [
                    'https://polygon-rpc.com',
                    'https://rpc.ankr.com/polygon',
                    'https://polygon.llamarpc.com',
                    'https://polygon.blockpi.network/v1/rpc/public'
                ],
                currency: 'MATIC'
            },
            arbitrum: {
                name: 'Arbitrum',
                rpcEndpoints: [
                    'https://arb1.arbitrum.io/rpc',
                    'https://rpc.ankr.com/arbitrum',
                    'https://arbitrum.llamarpc.com',
                    'https://arbitrum.blockpi.network/v1/rpc/public'
                ],
                currency: 'ETH'
            }
        };
        this.currentChain = 'ethereum';
        this.init();
    }

    init() {
        this.addressInput = document.getElementById('addressInput');
        this.checkButton = document.getElementById('checkButton');
        this.chainSelector = document.getElementById('chainSelector');
        this.resultDiv = document.getElementById('result');
        this.loadingDiv = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultDetails = document.getElementById('resultDetails');
        this.errorMessage = document.getElementById('errorMessage');

        this.bindEvents();
    }

    bindEvents() {
        this.checkButton.addEventListener('click', () => this.checkAddress());
        this.addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAddress();
            }
        });
        
        this.addressInput.addEventListener('input', () => {
            this.hideAllMessages();
        });
        
        this.chainSelector.addEventListener('change', (e) => {
            this.currentChain = e.target.value;
            this.hideAllMessages();
        });
    }

    async checkAddress() {
        const address = this.addressInput.value.trim();
        
        if (!this.isValidAddress(address)) {
            this.showError('Please enter a valid Ethereum address (42 characters starting with 0x)');
            return;
        }

        this.showLoading();
        
        try {
            const result = await this.analyzeAddress(address);
            this.showResult(result);
        } catch (error) {
            this.showError(`Error checking address: ${error.message}`);
        }
    }

    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    async analyzeAddress(address) {
        const chain = this.chains[this.currentChain];
        const rpcEndpoints = chain.rpcEndpoints;

        for (const rpcUrl of rpcEndpoints) {
            try {
                const code = await this.getCode(address, rpcUrl);
                const balance = await this.getBalance(address, rpcUrl);
                
                return this.determineAddressType(address, code, balance, chain);
            } catch (error) {
                console.warn(`RPC ${rpcUrl} failed, trying next...`);
                continue;
            }
        }
        
        throw new Error(`All ${chain.name} RPC endpoints failed. Please try again later.`);
    }

    async getCode(address, rpcUrl) {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getCode',
                params: [address, 'latest'],
                id: 1
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(`RPC Error: ${data.error.message}`);
        }
        
        return data.result;
    }

    async getBalance(address, rpcUrl) {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [address, 'latest'],
                id: 1
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(`RPC Error: ${data.error.message}`);
        }
        
        return data.result;
    }

    determineAddressType(address, code, balance, chain) {
        const hasCode = code && code !== '0x' && code.length > 2;
        const balanceInWei = BigInt(balance);
        const balanceInToken = Number(balanceInWei) / 1e18;

        if (!hasCode) {
            return {
                type: 'EOA',
                title: 'EOA (Externally Owned Account)',
                icon: '👤',
                details: `
                    <strong>Type:</strong> Externally Owned Account<br>
                    <strong>Chain:</strong> ${chain.name}<br>
                    <strong>Address:</strong> <code>${address}</code><br>
                    <strong>Balance:</strong> ${balanceInToken.toFixed(6)} ${chain.currency}<br>
                    <strong>Code:</strong> None (EOA addresses don't contain code)<br>
                    <strong>Description:</strong> This is a regular wallet address controlled by a private key.
                `
            };
        }

        const smartWalletInfo = this.detectSmartWallet(code, chain.name);
        
        if (smartWalletInfo.isSmartWallet) {
            return {
                type: 'SMART_WALLET',
                title: 'Smart Wallet',
                icon: '🔐',
                details: `
                    <strong>Type:</strong> Smart Wallet<br>
                    <strong>Chain:</strong> ${chain.name}<br>
                    <strong>Address:</strong> <code>${address}</code><br>
                    <strong>Balance:</strong> ${balanceInToken.toFixed(6)} ${chain.currency}<br>
                    <strong>Code Length:</strong> ${(code.length - 2) / 2} bytes<br>
                    <strong>Detected Pattern:</strong> ${smartWalletInfo.pattern}<br>
                    <strong>Description:</strong> This appears to be a smart contract wallet that provides enhanced security features.
                `
            };
        }

        return {
            type: 'CONTRACT',
            title: 'Smart Contract',
            icon: '📄',
            details: `
                <strong>Type:</strong> Smart Contract<br>
                <strong>Chain:</strong> ${chain.name}<br>
                <strong>Address:</strong> <code>${address}</code><br>
                <strong>Balance:</strong> ${balanceInToken.toFixed(6)} ${chain.currency}<br>
                <strong>Code Length:</strong> ${(code.length - 2) / 2} bytes<br>
                <strong>Description:</strong> This is a smart contract address containing executable code.
            `
        };
    }

    detectSmartWallet(code, chainName) {
        const codeStr = code.toLowerCase();
        
        // Enhanced smart wallet detection patterns
        const patterns = {
            // EIP-1167 Minimal Proxy (most common)
            minimalProxy: {
                pattern: '363d3d373d3d3d363d73',
                name: 'Minimal Proxy (EIP-1167)'
            },
            // EIP-1967 Proxy Storage Slot
            eip1967Proxy: {
                pattern: '360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc',
                name: 'EIP-1967 Proxy'
            },
            // Gnosis Safe patterns
            gnosisSafe: {
                pattern: '6080604052',
                name: 'Gnosis Safe'
            },
            // Account Abstraction (EIP-4337)
            accountAbstraction: {
                pattern: '3d602d80600a3d3981f3363d3d373d3d3d363d73',
                name: 'Account Abstraction Wallet'
            },
            // Common wallet function selectors
            walletFunctions: {
                pattern: 'a9059cbb', // transfer function
                name: 'Wallet Contract'
            },
            // Base/L2 specific patterns
            baseWallet: {
                pattern: '5c60da1b', // Common Base wallet pattern
                name: 'Base Smart Wallet'
            },
            // Argent wallet patterns
            argent: {
                pattern: '84b0196e', // Common Argent pattern
                name: 'Argent Wallet'
            }
        };

        // Check each pattern
        for (const [key, {pattern, name}] of Object.entries(patterns)) {
            if (codeStr.includes(pattern.toLowerCase())) {
                return {
                    isSmartWallet: true,
                    pattern: name,
                    patternKey: key
                };
            }
        }

        // Additional heuristics for smart wallets
        const codeLength = (code.length - 2) / 2;
        
        // Very small contracts are likely proxies
        if (codeLength < 100 && codeLength > 20) {
            return {
                isSmartWallet: true,
                pattern: 'Likely Proxy Contract',
                patternKey: 'smallProxy'
            };
        }

        // Check for multiple wallet-like function selectors
        const walletSelectors = [
            'a9059cbb', // transfer
            '23b872dd', // transferFrom
            '095ea7b3', // approve
            'dd62ed3e', // allowance
            '18160ddd', // totalSupply
            'b88d4fde', // execute (common in smart wallets)
            '6a761202', // execTransaction (Gnosis Safe)
        ];

        const foundSelectors = walletSelectors.filter(selector => 
            codeStr.includes(selector.toLowerCase())
        ).length;

        if (foundSelectors >= 3) {
            return {
                isSmartWallet: true,
                pattern: 'Multi-function Wallet Contract',
                patternKey: 'multiFunction'
            };
        }

        return {
            isSmartWallet: false,
            pattern: null,
            patternKey: null
        };
    }

    showResult(result) {
        this.hideAllMessages();
        
        this.resultTitle.textContent = result.title;
        this.resultIcon.textContent = result.icon;
        this.resultDetails.innerHTML = result.details;
        
        // Add appropriate CSS class
        this.resultDiv.className = `result ${result.type.toLowerCase().replace('_', '-')}`;
        this.resultDiv.classList.remove('hidden');
    }

    showError(message) {
        this.hideAllMessages();
        this.errorMessage.textContent = message;
        this.errorDiv.classList.remove('hidden');
    }

    showLoading() {
        this.hideAllMessages();
        this.loadingDiv.classList.remove('hidden');
        this.checkButton.disabled = true;
    }

    hideAllMessages() {
        this.resultDiv.classList.add('hidden');
        this.errorDiv.classList.add('hidden');
        this.loadingDiv.classList.add('hidden');
        this.checkButton.disabled = false;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EVMAddressChecker();
});

// Add some example addresses for testing
const exampleAddresses = {
    eoa: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
    contract: '0xA0b86a33E6417c7B78B8C4e6D7e5B4F9C1234567', // Example contract
    smartWallet: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' // UNI token contract (for demo)
};

// Add helpful tooltips or suggestions
console.log('EVM Address Checker loaded!');
console.log('Example addresses for testing:');
console.log('EOA:', exampleAddresses.eoa);
console.log('Contract:', exampleAddresses.contract);
console.log('Smart Wallet:', exampleAddresses.smartWallet);
