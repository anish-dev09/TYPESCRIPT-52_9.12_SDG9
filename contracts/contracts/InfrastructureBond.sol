// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InfrastructureBond
 * @dev ERC-20 token representing fractional ownership of infrastructure bonds
 * 
 * PROBLEM SOLVED: High entry barriers (₹10L minimum investment)
 * SOLUTION: 1 token = ₹100, enabling micro-investments
 * 
 * Key Features:
 * - Fractional tokenization (low denomination)
 * - Interest calculation mechanism
 * - Pausable for emergency stops
 * - Role-based minting/burning
 */
contract InfrastructureBond is ERC20, AccessControl, Pausable, ReentrancyGuard {
    
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Token economics
    uint256 public constant TOKEN_VALUE = 100; // 1 token = ₹100 (or $100 equivalent)
    uint8 private constant DECIMALS = 18;
    
    // Interest tracking
    struct InterestInfo {
        uint256 lastClaimTime;
        uint256 totalClaimed;
    }
    
    mapping(address => InterestInfo) public interestData;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, uint256 projectId);
    event TokensBurned(address indexed from, uint256 amount);
    event InterestClaimed(address indexed holder, uint256 amount);
    event FundsLocked(address indexed holder, uint256 amount);
    event FundsUnlocked(address indexed holder, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint new bond tokens (fractional ownership)
     * Only callable by addresses with MINTER_ROLE (BondIssuance contract)
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        
        _mint(to, amount);
        
        // Initialize interest tracking
        if (interestData[to].lastClaimTime == 0) {
            interestData[to].lastClaimTime = block.timestamp;
        }
    }
    
    /**
     * @dev Burn bond tokens (redemption or penalties)
     */
    function burn(address from, uint256 amount) 
        external 
        onlyRole(BURNER_ROLE) 
    {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(from) >= amount, "Insufficient balance");
        
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Calculate accrued interest for a holder
     * Formula: (tokens held × days held × annual rate) / 365
     */
    function calculateAccruedInterest(
        address holder,
        uint256 annualRatePercent
    ) external view returns (uint256) {
        uint256 balance = balanceOf(holder);
        if (balance == 0) return 0;
        
        uint256 lastClaim = interestData[holder].lastClaimTime;
        if (lastClaim == 0) lastClaim = block.timestamp;
        
        uint256 daysHeld = (block.timestamp - lastClaim) / 1 days;
        
        // Interest = (balance × rate × days) / (365 × 100)
        // Using basis points for precision (rate is in percentage)
        uint256 interest = (balance * annualRatePercent * daysHeld) / (365 * 100);
        
        return interest;
    }
    
    /**
     * @dev Record interest claim
     */
    function recordInterestClaim(address holder, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
    {
        interestData[holder].lastClaimTime = block.timestamp;
        interestData[holder].totalClaimed += amount;
        emit InterestClaimed(holder, amount);
    }
    
    /**
     * @dev Get interest information for a holder
     */
    function getInterestInfo(address holder) 
        external 
        view 
        returns (uint256 lastClaim, uint256 totalClaimed) 
    {
        return (
            interestData[holder].lastClaimTime,
            interestData[holder].totalClaimed
        );
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override transfer to add pause functionality
     */
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add pause functionality
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Get token value in base currency
     */
    function getTokenValue() external pure returns (uint256) {
        return TOKEN_VALUE;
    }
    
    /**
     * @dev Calculate total value of holdings
     */
    function getHoldingValue(address holder) external view returns (uint256) {
        return balanceOf(holder) * TOKEN_VALUE;
    }
}
