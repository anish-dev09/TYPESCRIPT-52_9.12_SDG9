// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InfrastructureBond.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BondIssuance
 * @dev Manages investment collection, escrow, and fund release for infrastructure projects
 * 
 * PROBLEMS SOLVED:
 * - Slow settlement (instant blockchain transactions)
 * - Lack of transparency (all investments on-chain)
 * - Manual fund management (automated escrow)
 * 
 * Key Features:
 * - Escrow-based fund locking
 * - Investment tracking per user per project
 * - Automated token minting on investment
 * - Milestone-based fund release
 */
contract BondIssuance is AccessControl, ReentrancyGuard, Pausable {
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROJECT_MANAGER_ROLE = keccak256("PROJECT_MANAGER_ROLE");
    
    // Bond token contract
    InfrastructureBond public bondToken;
    
    // Project structure
    struct Project {
        uint256 id;
        string name;
        uint256 fundingGoal;
        uint256 fundsRaised;
        uint256 fundsReleased;
        uint256 interestRateAnnual; // in percentage (e.g., 850 = 8.5%)
        uint256 durationMonths;
        address projectWallet;
        bool isActive;
        uint256 createdAt;
    }
    
    // Investment tracking
    struct Investment {
        uint256 projectId;
        address investor;
        uint256 amount;
        uint256 tokensMinted;
        uint256 timestamp;
    }
    
    // Storage
    mapping(uint256 => Project) public projects;
    mapping(address => mapping(uint256 => uint256)) public userInvestments; // user => projectId => amount
    mapping(uint256 => address[]) public projectInvestors; // projectId => investor addresses
    mapping(uint256 => uint256) public projectInvestorCount; // projectId => count
    
    uint256 public projectCount;
    uint256 public totalFundsRaised;
    uint256 public totalFundsInEscrow;
    
    Investment[] public investments;
    
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        uint256 fundingGoal,
        uint256 interestRate
    );
    event InvestmentMade(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount,
        uint256 tokensMinted
    );
    event FundsReleased(
        uint256 indexed projectId,
        uint256 amount,
        address indexed recipient
    );
    event ProjectStatusChanged(uint256 indexed projectId, bool isActive);
    
    constructor(address _bondToken) {
        require(_bondToken != address(0), "Invalid bond token address");
        bondToken = InfrastructureBond(_bondToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PROJECT_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new infrastructure project
     */
    function createProject(
        string memory name,
        uint256 fundingGoal,
        uint256 interestRateAnnual,
        uint256 durationMonths,
        address projectWallet
    ) external onlyRole(PROJECT_MANAGER_ROLE) returns (uint256) {
        require(bytes(name).length > 0, "Project name required");
        require(fundingGoal > 0, "Funding goal must be greater than zero");
        require(interestRateAnnual > 0 && interestRateAnnual <= 2000, "Interest rate must be between 0-20%");
        require(durationMonths > 0 && durationMonths <= 360, "Duration must be between 1-360 months");
        require(projectWallet != address(0), "Invalid project wallet");
        
        projectCount++;
        uint256 projectId = projectCount;
        
        projects[projectId] = Project({
            id: projectId,
            name: name,
            fundingGoal: fundingGoal,
            fundsRaised: 0,
            fundsReleased: 0,
            interestRateAnnual: interestRateAnnual,
            durationMonths: durationMonths,
            projectWallet: projectWallet,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit ProjectCreated(projectId, name, fundingGoal, interestRateAnnual);
        return projectId;
    }
    
    /**
     * @dev Invest in a project (send ETH/MATIC, receive bond tokens)
     */
    function investInProject(uint256 projectId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        Project storage project = projects[projectId];
        require(project.isActive, "Project is not active");
        require(msg.value > 0, "Investment amount must be greater than zero");
        require(
            project.fundsRaised + msg.value <= project.fundingGoal,
            "Investment exceeds funding goal"
        );
        
        // Calculate tokens to mint (1 token = TOKEN_VALUE in wei)
        uint256 tokenValue = bondToken.getTokenValue();
        uint256 tokensToMint = (msg.value * 10**18) / (tokenValue * 10**18 / 100);
        require(tokensToMint > 0, "Investment too small");
        
        // Update project and global state
        project.fundsRaised += msg.value;
        totalFundsRaised += msg.value;
        totalFundsInEscrow += msg.value;
        
        // Track user investment
        if (userInvestments[msg.sender][projectId] == 0) {
            projectInvestors[projectId].push(msg.sender);
            projectInvestorCount[projectId]++;
        }
        userInvestments[msg.sender][projectId] += msg.value;
        
        // Record investment
        investments.push(Investment({
            projectId: projectId,
            investor: msg.sender,
            amount: msg.value,
            tokensMinted: tokensToMint,
            timestamp: block.timestamp
        }));
        
        // Mint bond tokens to investor
        bondToken.mint(msg.sender, tokensToMint);
        
        emit InvestmentMade(projectId, msg.sender, msg.value, tokensToMint);
    }
    
    /**
     * @dev Release funds to project (milestone completion)
     * Only callable by ADMIN_ROLE (typically MilestoneManager contract)
     */
    function releaseFunds(uint256 projectId, uint256 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
        nonReentrant 
    {
        Project storage project = projects[projectId];
        require(project.isActive, "Project is not active");
        require(amount > 0, "Amount must be greater than zero");
        require(
            project.fundsReleased + amount <= project.fundsRaised,
            "Cannot release more than raised"
        );
        require(totalFundsInEscrow >= amount, "Insufficient escrow balance");
        
        project.fundsReleased += amount;
        totalFundsInEscrow -= amount;
        
        // Transfer funds to project wallet
        (bool success, ) = project.projectWallet.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(projectId, amount, project.projectWallet);
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 projectId) 
        external 
        view 
        returns (
            string memory name,
            uint256 fundingGoal,
            uint256 fundsRaised,
            uint256 fundsReleased,
            uint256 interestRate,
            uint256 duration,
            bool isActive
        ) 
    {
        Project memory project = projects[projectId];
        return (
            project.name,
            project.fundingGoal,
            project.fundsRaised,
            project.fundsReleased,
            project.interestRateAnnual,
            project.durationMonths,
            project.isActive
        );
    }
    
    /**
     * @dev Get project progress (percentage)
     */
    function getProjectProgress(uint256 projectId) 
        external 
        view 
        returns (uint256 fundingProgress, uint256 releaseProgress) 
    {
        Project memory project = projects[projectId];
        
        fundingProgress = project.fundingGoal > 0 
            ? (project.fundsRaised * 100) / project.fundingGoal 
            : 0;
            
        releaseProgress = project.fundsRaised > 0 
            ? (project.fundsReleased * 100) / project.fundsRaised 
            : 0;
            
        return (fundingProgress, releaseProgress);
    }
    
    /**
     * @dev Get user's investment in a project
     */
    function getUserInvestment(address user, uint256 projectId) 
        external 
        view 
        returns (uint256) 
    {
        return userInvestments[user][projectId];
    }
    
    /**
     * @dev Get total number of investors in a project
     */
    function getProjectInvestorCount(uint256 projectId) 
        external 
        view 
        returns (uint256) 
    {
        return projectInvestorCount[projectId];
    }
    
    /**
     * @dev Get all investors for a project
     */
    function getProjectInvestors(uint256 projectId) 
        external 
        view 
        returns (address[] memory) 
    {
        return projectInvestors[projectId];
    }
    
    /**
     * @dev Get funds available in escrow for a project
     */
    function getEscrowBalance(uint256 projectId) 
        external 
        view 
        returns (uint256) 
    {
        Project memory project = projects[projectId];
        return project.fundsRaised - project.fundsReleased;
    }
    
    /**
     * @dev Toggle project active status
     */
    function setProjectStatus(uint256 projectId, bool isActive) 
        external 
        onlyRole(PROJECT_MANAGER_ROLE) 
    {
        projects[projectId].isActive = isActive;
        emit ProjectStatusChanged(projectId, isActive);
    }
    
    /**
     * @dev Get total investments count
     */
    function getInvestmentCount() external view returns (uint256) {
        return investments.length;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
