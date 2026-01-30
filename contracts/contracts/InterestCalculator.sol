// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InfrastructureBond.sol";
import "./BondIssuance.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InterestCalculator
 * @dev Automated interest accrual and distribution for bond holders
 * 
 * PROBLEM SOLVED: Manual interest calculation and distribution
 * SOLUTION: Automated on-chain interest calculation and claiming
 * 
 * Key Features:
 * - Automatic interest accrual calculation
 * - User-initiated claiming mechanism
 * - Project-specific interest rates
 * - Payment history tracking
 */
contract InterestCalculator is AccessControl, ReentrancyGuard {
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Contracts
    InfrastructureBond public bondToken;
    BondIssuance public bondIssuance;
    
    // Interest accrual tracking
    struct AccrualInfo {
        uint256 projectId;
        address investor;
        uint256 tokensHeld;
        uint256 lastAccrualDate;
        uint256 accruedAmount;
        uint256 paidAmount;
    }
    
    // Storage
    mapping(address => mapping(uint256 => AccrualInfo)) public accruals; // investor => projectId => accrual
    mapping(address => uint256[]) public userProjects; // investor => projectIds
    
    uint256 public totalInterestAccrued;
    uint256 public totalInterestPaid;
    
    // Events
    event InterestAccrued(
        address indexed investor,
        uint256 indexed projectId,
        uint256 amount
    );
    event InterestClaimed(
        address indexed investor,
        uint256 indexed projectId,
        uint256 amount,
        uint256 tokensMinted
    );
    event InterestDistributed(
        uint256 indexed projectId,
        uint256 totalAmount,
        uint256 investorCount
    );
    
    constructor(address _bondToken, address _bondIssuance) {
        require(_bondToken != address(0), "Invalid bond token address");
        require(_bondIssuance != address(0), "Invalid bond issuance address");
        
        bondToken = InfrastructureBond(_bondToken);
        bondIssuance = BondIssuance(_bondIssuance);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Calculate accrued interest for an investor in a project
     */
    function calculateAccruedInterest(
        address investor,
        uint256 projectId
    ) public view returns (uint256) {
        // Get investor's token balance
        uint256 tokensHeld = bondToken.balanceOf(investor);
        if (tokensHeld == 0) return 0;
        
        // Get user's investment in this project
        uint256 investment = bondIssuance.getUserInvestment(investor, projectId);
        if (investment == 0) return 0;
        
        // Get project interest rate
        (, , , , uint256 interestRate, , ) = bondIssuance.getProject(projectId);
        
        // Get last accrual date
        AccrualInfo memory accrual = accruals[investor][projectId];
        uint256 lastDate = accrual.lastAccrualDate;
        if (lastDate == 0) {
            // Use current timestamp if never accrued before
            lastDate = block.timestamp;
        }
        
        // Calculate days since last accrual
        uint256 daysPassed = (block.timestamp - lastDate) / 1 days;
        if (daysPassed == 0) return accrual.accruedAmount;
        
        // Calculate interest: (tokens × rate × days) / (365 × 100)
        // Interest rate is in basis points (850 = 8.5%)
        uint256 newInterest = (tokensHeld * interestRate * daysPassed) / (365 * 100);
        
        return accrual.accruedAmount + newInterest;
    }
    
    /**
     * @dev Update accrual information for an investor
     */
    function updateAccrual(address investor, uint256 projectId) public {
        uint256 investment = bondIssuance.getUserInvestment(investor, projectId);
        require(investment > 0, "No investment found");
        
        uint256 tokensHeld = bondToken.balanceOf(investor);
        uint256 accruedAmount = calculateAccruedInterest(investor, projectId);
        
        AccrualInfo storage accrual = accruals[investor][projectId];
        
        if (accrual.lastAccrualDate == 0) {
            // First time tracking this investor-project pair
            accrual.projectId = projectId;
            accrual.investor = investor;
            userProjects[investor].push(projectId);
        }
        
        accrual.tokensHeld = tokensHeld;
        accrual.lastAccrualDate = block.timestamp;
        accrual.accruedAmount = accruedAmount;
        
        totalInterestAccrued += accruedAmount - accrual.accruedAmount;
        
        emit InterestAccrued(investor, projectId, accruedAmount);
    }
    
    /**
     * @dev Claim accrued interest (mints new tokens)
     */
    function claimInterest(uint256 projectId) external nonReentrant {
        address investor = msg.sender;
        
        // Update accrual first
        updateAccrual(investor, projectId);
        
        AccrualInfo storage accrual = accruals[investor][projectId];
        uint256 claimableAmount = accrual.accruedAmount;
        
        require(claimableAmount > 0, "No interest to claim");
        
        // Calculate tokens to mint based on interest amount
        uint256 tokenValue = bondToken.getTokenValue();
        uint256 tokensToMint = (claimableAmount * 10**18) / (tokenValue * 10**18 / 100);
        require(tokensToMint > 0, "Interest too small to claim");
        
        // Update accrual state
        accrual.paidAmount += claimableAmount;
        accrual.accruedAmount = 0;
        totalInterestPaid += claimableAmount;
        
        // Mint interest tokens to investor
        bondToken.mint(investor, tokensToMint);
        
        // Record claim in bond token
        bondToken.recordInterestClaim(investor, tokensToMint);
        
        emit InterestClaimed(investor, projectId, claimableAmount, tokensToMint);
    }
    
    /**
     * @dev Batch update accruals for multiple investors in a project
     */
    function batchUpdateAccruals(
        address[] calldata investors,
        uint256 projectId
    ) external onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < investors.length; i++) {
            if (bondIssuance.getUserInvestment(investors[i], projectId) > 0) {
                updateAccrual(investors[i], projectId);
            }
        }
    }
    
    /**
     * @dev Get accrual information for an investor
     */
    function getAccrualInfo(address investor, uint256 projectId)
        external
        view
        returns (
            uint256 tokensHeld,
            uint256 lastAccrualDate,
            uint256 accruedAmount,
            uint256 paidAmount,
            uint256 currentAccrued
        )
    {
        AccrualInfo memory accrual = accruals[investor][projectId];
        uint256 current = calculateAccruedInterest(investor, projectId);
        
        return (
            accrual.tokensHeld,
            accrual.lastAccrualDate,
            accrual.accruedAmount,
            accrual.paidAmount,
            current
        );
    }
    
    /**
     * @dev Get all projects an investor has invested in
     */
    function getUserProjects(address investor)
        external
        view
        returns (uint256[] memory)
    {
        return userProjects[investor];
    }
    
    /**
     * @dev Calculate total accrued interest for an investor across all projects
     */
    function getTotalAccruedInterest(address investor)
        external
        view
        returns (uint256)
    {
        uint256[] memory projects = userProjects[investor];
        uint256 total = 0;
        
        for (uint256 i = 0; i < projects.length; i++) {
            total += calculateAccruedInterest(investor, projects[i]);
        }
        
        return total;
    }
    
    /**
     * @dev Get total interest paid to an investor across all projects
     */
    function getTotalPaidInterest(address investor)
        external
        view
        returns (uint256)
    {
        uint256[] memory projects = userProjects[investor];
        uint256 total = 0;
        
        for (uint256 i = 0; i < projects.length; i++) {
            total += accruals[investor][projects[i]].paidAmount;
        }
        
        return total;
    }
    
    /**
     * @dev Distribute interest to all investors in a project
     * This is a helper function to update all accruals at once
     */
    function distributeProjectInterest(uint256 projectId)
        external
        onlyRole(ADMIN_ROLE)
        returns (uint256 totalDistributed, uint256 investorCount)
    {
        address[] memory investors = bondIssuance.getProjectInvestors(projectId);
        totalDistributed = 0;
        investorCount = investors.length;
        
        for (uint256 i = 0; i < investors.length; i++) {
            updateAccrual(investors[i], projectId);
            totalDistributed += accruals[investors[i]][projectId].accruedAmount;
        }
        
        emit InterestDistributed(projectId, totalDistributed, investorCount);
        return (totalDistributed, investorCount);
    }
    
    /**
     * @dev Get platform-wide interest statistics
     */
    function getGlobalStats()
        external
        view
        returns (uint256 totalAccrued, uint256 totalPaid, uint256 pending)
    {
        return (
            totalInterestAccrued,
            totalInterestPaid,
            totalInterestAccrued - totalInterestPaid
        );
    }
}
