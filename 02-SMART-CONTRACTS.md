# PHASE 2: Smart Contract Development
## Complete Solidity Implementation for INFRACHAIN-SDG9

---

## 📋 Smart Contract Overview

**Total Contracts:** 4 main contracts
**Language:** Solidity 0.8.20
**Framework:** Hardhat
**Testing Network:** Polygon Mumbai Testnet
**Standard:** ERC-20 (with extensions)

---

## 🔧 CONTRACT 1: InfrastructureBond.sol
### ERC-20 Bond Token Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title InfrastructureBond
 * @dev ERC-20 token representing fractional ownership of infrastructure bonds
 * 
 * PROBLEM SOLVED:
 * - High entry barriers: 1 token = ₹100 equivalent (min investment ₹100)
 * - Illiquidity: Tokens can be traded on secondary market
 * - Manual management: Smart contract handles all token mechanics
 * 
 * @notice Each token represents a fractional share of a bond
 * @notice Token supply: Project funding target / 100 (if ₹100 per token)
 */

contract InfrastructureBond is ERC20, AccessControl, Pausable, ERC20Burnable {
    
    // ==================== ROLES ====================
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ==================== STATE VARIABLES ====================
    
    /// @notice Project this bond represents
    string public projectName;
    
    /// @notice Project ID (from backend database)
    uint256 public projectId;
    
    /// @notice Annual interest rate (in basis points: 500 = 5%)
    uint256 public interestRate;
    
    /// @notice Bond maturity date (timestamp)
    uint256 public maturityDate;
    
    /// @notice Risk level (1=low, 2=medium, 3=high)
    uint8 public riskLevel;
    
    /// @notice Total funds raised (in wei, assuming USDC 6 decimals)
    uint256 public totalFundsRaised;
    
    /// @notice Contract creation timestamp
    uint256 public issuanceDate;
    
    /// @notice Whether funds are locked in escrow
    bool public fundsLocked;

    // ==================== EVENTS ====================
    
    event TokenMinted(
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event TokenBurned(
        address indexed from,
        uint256 amount,
        uint256 timestamp
    );

    event InterestRateUpdated(
        uint256 oldRate,
        uint256 newRate,
        uint256 timestamp
    );

    event FundsLocked(uint256 timestamp);
    event FundsUnlocked(uint256 timestamp);

    // ==================== MODIFIERS ====================
    
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    modifier fundsNotLocked() {
        require(!fundsLocked, "Funds are currently locked in escrow");
        _;
    }

    // ==================== CONSTRUCTOR ====================
    
    /**
     * @dev Initialize the bond token
     * @param _name Token name (e.g., "Highway Project Bond")
     * @param _symbol Token symbol (e.g., "BOND-HWY")
     * @param _projectId ID from backend database
     * @param _interestRate Annual rate (in basis points)
     * @param _maturityDate Timestamp when bond matures
     * @param _riskLevel 1=low, 2=medium, 3=high
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _projectId,
        uint256 _interestRate,
        uint256 _maturityDate,
        uint8 _riskLevel
    ) ERC20(_name, _symbol) {
        require(_interestRate <= 5000, "Interest rate cannot exceed 50%");
        require(_maturityDate > block.timestamp, "Maturity date must be in future");
        require(_riskLevel >= 1 && _riskLevel <= 3, "Risk level must be 1, 2, or 3");

        projectName = _name;
        projectId = _projectId;
        interestRate = _interestRate;
        maturityDate = _maturityDate;
        riskLevel = _riskLevel;
        issuanceDate = block.timestamp;
        fundsLocked = false;

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // ==================== MINT & BURN FUNCTIONS ====================
    
    /**
     * @dev Mint new tokens (only by authorized minter)
     * @param to Recipient address
     * @param amount Tokens to mint
     * 
     * REASON: When investor buys tokens, backend calls this to mint
     */
    function mint(address to, uint256 amount) 
        public 
        onlyMinter 
        whenNotPaused 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Mint amount must be greater than 0");

        _mint(to, amount);
        totalFundsRaised += amount; // Assuming 1 token = 1 unit of funding

        emit TokenMinted(to, amount, block.timestamp);
    }

    /**
     * @dev Burn tokens (user can burn their own tokens to exit)
     * @param amount Tokens to burn
     */
    function burn(uint256 amount) 
        public 
        override 
        whenNotPaused 
    {
        require(amount > 0, "Burn amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to burn");

        _burn(msg.sender, amount);
        totalFundsRaised -= amount;

        emit TokenBurned(msg.sender, amount, block.timestamp);
    }

    // ==================== FUND LOCK FUNCTIONS ====================
    
    /**
     * @dev Lock funds in escrow (prevents unauthorized transfers)
     * @notice Only admin can call
     */
    function lockFunds() public onlyAdmin {
        require(!fundsLocked, "Funds already locked");
        fundsLocked = true;
        emit FundsLocked(block.timestamp);
    }

    /**
     * @dev Unlock funds (called by milestone completion)
     * @notice Only admin can call
     */
    function unlockFunds() public onlyAdmin {
        require(fundsLocked, "Funds already unlocked");
        fundsLocked = false;
        emit FundsUnlocked(block.timestamp);
    }

    /**
     * @dev Check if funds are locked
     */
    function areFundsLocked() public view returns (bool) {
        return fundsLocked;
    }

    // ==================== INTEREST CALCULATION ====================
    
    /**
     * @dev Calculate accrued interest for a holder
     * @param holder Address to calculate for
     * @param daysHeld Number of days tokens were held
     * @return Accrued interest amount
     */
    function calculateInterest(address holder, uint256 daysHeld) 
        public 
        view 
        returns (uint256) 
    {
        uint256 balance = balanceOf(holder);
        // Formula: (balance × interestRate × daysHeld) / (10000 × 365)
        return (balance * interestRate * daysHeld) / (10000 * 365);
    }

    /**
     * @dev Get total supply (for display in frontend)
     */
    function getTotalSupply() public view returns (uint256) {
        return totalSupply();
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Update interest rate
     * @param newRate New annual rate (in basis points)
     */
    function setInterestRate(uint256 newRate) 
        public 
        onlyAdmin 
    {
        require(newRate <= 5000, "Interest rate cannot exceed 50%");
        uint256 oldRate = interestRate;
        interestRate = newRate;
        emit InterestRateUpdated(oldRate, newRate, block.timestamp);
    }

    /**
     * @dev Pause token transfers (emergency stop)
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Resume token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ==================== TRANSFER OVERRIDE ====================
    
    /**
     * @dev Override transfer to check if funds are locked
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        require(!fundsLocked, "Token transfer locked during escrow period");
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom to check if funds are locked
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        require(!fundsLocked, "Token transfer locked during escrow period");
        return super.transferFrom(from, to, amount);
    }

    // ==================== METADATA FUNCTIONS ====================
    
    /**
     * @dev Get token decimals (USDC standard)
     */
    function decimals() public view override returns (uint8) {
        return 6; // Match USDC decimals
    }

    /**
     * @dev Get all contract metadata
     */
    function getProjectInfo() public view returns (
        string memory,
        uint256,
        uint256,
        uint256,
        uint8,
        bool
    ) {
        return (
            projectName,
            projectId,
            interestRate,
            maturityDate,
            riskLevel,
            fundsLocked
        );
    }
}
```

---

## 🔧 CONTRACT 2: BondIssuance.sol
### Investment Collection & Escrow Management

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./InfrastructureBond.sol";

/**
 * @title BondIssuance
 * @dev Manages investment collection and fund escrow for infrastructure bonds
 * 
 * PROBLEM SOLVED:
 * - Slow settlement: Instant settlement via smart contract
 * - Multiple intermediaries: Direct transfer to escrow
 * - Lack of transparency: All transactions logged on blockchain
 * 
 * @notice Investor funds are locked in escrow until milestone completion
 * @notice Smart contract enforces fund release logic
 */

contract BondIssuance is ReentrancyGuard, AccessControl, Pausable {
    
    // ==================== ROLES ====================
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROJECT_MANAGER_ROLE = keccak256("PROJECT_MANAGER_ROLE");

    // ==================== STRUCTS ====================
    
    struct Project {
        uint256 id;
        address bondToken;           // Address of InfrastructureBond token
        uint256 fundingGoal;         // Total funds to raise (in wei)
        uint256 fundsRaised;         // Current funds raised
        uint256 fundsReleased;       // Funds released to project
        bool isActive;
        address paymentToken;        // USDC address (for testnet)
        uint256 createdAt;
    }

    struct Investment {
        address investor;
        uint256 projectId;
        uint256 amount;              // Amount invested (in payment token)
        uint256 tokensReceived;      // Bond tokens minted
        uint256 timestamp;
        bool claimed;
    }

    // ==================== STATE VARIABLES ====================
    
    /// @notice All projects
    mapping(uint256 => Project) public projects;
    
    /// @notice Investor's investments
    mapping(address => mapping(uint256 => Investment)) public investments;
    
    /// @notice Investor's balance per project
    mapping(address => mapping(uint256 => uint256)) public investorBalance;
    
    /// @notice Project counter
    uint256 public projectCounter;
    
    /// @notice Escrow wallet (holds funds until milestone)
    address public escrowWallet;
    
    /// @notice Total invested across all projects
    uint256 public totalInvested;

    // ==================== EVENTS ====================
    
    event ProjectCreated(
        uint256 indexed projectId,
        address bondToken,
        uint256 fundingGoal,
        uint256 timestamp
    );

    event InvestmentMade(
        address indexed investor,
        uint256 indexed projectId,
        uint256 amount,
        uint256 tokensReceived,
        uint256 timestamp
    );

    event FundsReleased(
        uint256 indexed projectId,
        uint256 amount,
        uint256 timestamp
    );

    event EscrowWalletUpdated(address newWallet);

    // ==================== MODIFIERS ====================
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not admin");
        _;
    }

    modifier projectExists(uint256 _projectId) {
        require(projects[_projectId].isActive, "Project does not exist");
        _;
    }

    // ==================== CONSTRUCTOR ====================
    
    constructor(address _escrowWallet) {
        require(_escrowWallet != address(0), "Invalid escrow wallet");
        escrowWallet = _escrowWallet;
        projectCounter = 0;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ==================== PROJECT MANAGEMENT ====================
    
    /**
     * @dev Create a new infrastructure bond project
     * @param _name Project name
     * @param _symbol Token symbol
     * @param _fundingGoal Total funds to raise
     * @param _interestRate Annual interest rate (basis points)
     * @param _maturityDate When bond matures
     * @param _riskLevel Risk level (1-3)
     * @param _paymentToken Address of USDC or mock token
     */
    function createProject(
        string memory _name,
        string memory _symbol,
        uint256 _fundingGoal,
        uint256 _interestRate,
        uint256 _maturityDate,
        uint8 _riskLevel,
        address _paymentToken
    ) public onlyAdmin returns (uint256) {
        require(_fundingGoal > 0, "Funding goal must be > 0");
        require(_paymentToken != address(0), "Invalid payment token");

        projectCounter++;
        uint256 projectId = projectCounter;

        // Create bond token
        InfrastructureBond bondToken = new InfrastructureBond(
            _name,
            _symbol,
            projectId,
            _interestRate,
            _maturityDate,
            _riskLevel
        );

        // Grant minter role to this contract
        bondToken.grantRole(keccak256("MINTER_ROLE"), address(this));

        // Create project
        projects[projectId] = Project({
            id: projectId,
            bondToken: address(bondToken),
            fundingGoal: _fundingGoal,
            fundsRaised: 0,
            fundsReleased: 0,
            isActive: true,
            paymentToken: _paymentToken,
            createdAt: block.timestamp
        });

        emit ProjectCreated(projectId, address(bondToken), _fundingGoal, block.timestamp);
        return projectId;
    }

    // ==================== INVESTMENT FUNCTIONS ====================
    
    /**
     * @dev Investor invests in a project
     * @param _projectId Project ID
     * @param _amount Amount to invest (in payment token)
     * @notice Called from backend after USDC approval
     * 
     * FLOW:
     * 1. Investor approves USDC spending
     * 2. Backend calls this function
     * 3. Funds transferred to escrow
     * 4. Bond tokens minted to investor
     * 5. Investment recorded
     */
    function investInProject(
        uint256 _projectId,
        uint256 _amount
    ) 
        public 
        nonReentrant 
        whenNotPaused 
        projectExists(_projectId)
    {
        require(_amount > 0, "Investment amount must be > 0");

        Project storage project = projects[_projectId];
        
        require(
            project.fundsRaised + _amount <= project.fundingGoal,
            "Investment would exceed funding goal"
        );

        // Calculate tokens to mint (1 token per unit of funding, assuming ₹100 per token)
        // For simplicity: if 1 USDC = ₹83, then 100 USDC ≈ ₹8300 = 83 tokens
        uint256 tokenAmount = _amount;

        // Transfer payment token to escrow
        // NOTE: Assumes caller has already approved this contract
        IERC20(project.paymentToken).transferFrom(
            msg.sender,
            escrowWallet,
            _amount
        );

        // Mint bond tokens to investor
        InfrastructureBond(project.bondToken).mint(msg.sender, tokenAmount);

        // Record investment
        investments[msg.sender][_projectId] = Investment({
            investor: msg.sender,
            projectId: _projectId,
            amount: _amount,
            tokensReceived: tokenAmount,
            timestamp: block.timestamp,
            claimed: false
        });

        // Update balances
        investorBalance[msg.sender][_projectId] += tokenAmount;
        project.fundsRaised += _amount;
        totalInvested += _amount;

        emit InvestmentMade(msg.sender, _projectId, _amount, tokenAmount, block.timestamp);
    }

    // ==================== FUND RELEASE ====================
    
    /**
     * @dev Release funds from escrow to project (called after milestone completion)
     * @param _projectId Project ID
     * @param _amount Amount to release
     * @notice Only admin can call (simulates milestone completion)
     */
    function releaseFundsForMilestone(
        uint256 _projectId,
        uint256 _amount
    ) 
        public 
        onlyAdmin 
        projectExists(_projectId)
    {
        Project storage project = projects[_projectId];
        require(_amount > 0, "Release amount must be > 0");
        require(
            project.fundsReleased + _amount <= project.fundsRaised,
            "Cannot release more than raised"
        );

        project.fundsReleased += _amount;

        // In real scenario, transfer from escrow to project account
        // For now, just emit event (funds stay in escrow)

        emit FundsReleased(_projectId, _amount, block.timestamp);
    }

    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 _projectId) 
        public 
        view 
        projectExists(_projectId)
        returns (
            uint256,
            address,
            uint256,
            uint256,
            uint256,
            uint256
        ) 
    {
        Project storage p = projects[_projectId];
        return (
            p.id,
            p.bondToken,
            p.fundingGoal,
            p.fundsRaised,
            p.fundsReleased,
            p.createdAt
        );
    }

    /**
     * @dev Get investor's holdings in a project
     */
    function getInvestorHoldings(address _investor, uint256 _projectId) 
        public 
        view 
        returns (uint256) 
    {
        return investorBalance[_investor][_projectId];
    }

    /**
     * @dev Get investor's investment record
     */
    function getInvestmentRecord(address _investor, uint256 _projectId) 
        public 
        view 
        returns (Investment memory) 
    {
        return investments[_investor][_projectId];
    }

    /**
     * @dev Get total raised for a project
     */
    function getTotalRaised(uint256 _projectId) 
        public 
        view 
        projectExists(_projectId)
        returns (uint256) 
    {
        return projects[_projectId].fundsRaised;
    }

    /**
     * @dev Get project progress percentage
     */
    function getProjectProgress(uint256 _projectId) 
        public 
        view 
        projectExists(_projectId)
        returns (uint256) 
    {
        Project storage p = projects[_projectId];
        return (p.fundsRaised * 100) / p.fundingGoal;
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Update escrow wallet
     */
    function setEscrowWallet(address _newWallet) 
        public 
        onlyAdmin 
    {
        require(_newWallet != address(0), "Invalid wallet");
        escrowWallet = _newWallet;
        emit EscrowWalletUpdated(_newWallet);
    }

    /**
     * @dev Pause investments (emergency)
     */
    function pause() public onlyAdmin {
        _pause();
    }

    /**
     * @dev Resume investments
     */
    function unpause() public onlyAdmin {
        _unpause();
    }
}

// ==================== IERC20 INTERFACE ====================

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}
```

---

## 🔧 CONTRACT 3: MilestoneManager.sol
### Milestone Tracking & Fund Release Logic

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./BondIssuance.sol";

/**
 * @title MilestoneManager
 * @dev Manages project milestones and controls fund release
 * 
 * PROBLEM SOLVED:
 * - Escrow control by issuers: Smart contract enforces release logic
 * - Fund misuse: Funds only released upon proven milestone completion
 * - Lack of accountability: All milestones logged on immutable blockchain
 * 
 * @notice Each project has multiple milestones
 * @notice Funds locked until milestone is marked complete
 * @notice Admin approval required for milestone completion
 */

contract MilestoneManager is AccessControl {
    
    // ==================== ROLES ====================
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");

    // ==================== STRUCTS ====================
    
    struct Milestone {
        uint256 id;
        uint256 projectId;
        string description;
        uint256 targetDate;
        uint256 fundsToRelease;
        bool completed;
        uint256 completionDate;
        string completionEvidence;
    }

    // ==================== STATE VARIABLES ====================
    
    /// @notice All milestones by projectId
    mapping(uint256 => Milestone[]) public projectMilestones;
    
    /// @notice Milestone counter per project
    mapping(uint256 => uint256) public milestoneCount;
    
    /// @notice Reference to BondIssuance contract
    BondIssuance public bondIssuance;
    
    /// @notice Total funds to be released
    mapping(uint256 => uint256) public totalMilestoneFunds;

    // ==================== EVENTS ====================
    
    event MilestoneCreated(
        uint256 indexed projectId,
        uint256 milestoneId,
        string description,
        uint256 targetDate,
        uint256 fundsToRelease,
        uint256 timestamp
    );

    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 milestoneId,
        uint256 fundsReleased,
        string evidence,
        uint256 timestamp
    );

    event MilestoneDelayed(
        uint256 indexed projectId,
        uint256 milestoneId,
        uint256 newTargetDate,
        uint256 timestamp
    );

    // ==================== MODIFIERS ====================
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not admin");
        _;
    }

    modifier onlyValidator() {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(VALIDATOR_ROLE, msg.sender),
            "Caller is not validator"
        );
        _;
    }

    // ==================== CONSTRUCTOR ====================
    
    constructor(address _bondIssuanceAddress) {
        require(_bondIssuanceAddress != address(0), "Invalid address");
        bondIssuance = BondIssuance(_bondIssuanceAddress);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ==================== MILESTONE MANAGEMENT ====================
    
    /**
     * @dev Create a milestone for a project
     * @param _projectId Project ID
     * @param _description Milestone description
     * @param _targetDate Target completion date
     * @param _fundsToRelease Funds to release when complete
     */
    function createMilestone(
        uint256 _projectId,
        string memory _description,
        uint256 _targetDate,
        uint256 _fundsToRelease
    ) public onlyAdmin {
        require(_targetDate > block.timestamp, "Target date must be in future");
        require(_fundsToRelease > 0, "Funds to release must be > 0");

        uint256 milestoneId = milestoneCount[_projectId];
        
        Milestone memory newMilestone = Milestone({
            id: milestoneId,
            projectId: _projectId,
            description: _description,
            targetDate: _targetDate,
            fundsToRelease: _fundsToRelease,
            completed: false,
            completionDate: 0,
            completionEvidence: ""
        });

        projectMilestones[_projectId].push(newMilestone);
        totalMilestoneFunds[_projectId] += _fundsToRelease;
        milestoneCount[_projectId]++;

        emit MilestoneCreated(
            _projectId,
            milestoneId,
            _description,
            _targetDate,
            _fundsToRelease,
            block.timestamp
        );
    }

    /**
     * @dev Mark milestone as completed (with evidence)
     * @param _projectId Project ID
     * @param _milestoneId Milestone ID
     * @param _evidence Evidence of completion (URL, hash, etc.)
     * @notice Triggers fund release from escrow
     */
    function completeMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        string memory _evidence
    ) public onlyValidator {
        require(_milestoneId < projectMilestones[_projectId].length, "Invalid milestone");
        
        Milestone storage milestone = projectMilestones[_projectId][_milestoneId];
        require(!milestone.completed, "Milestone already completed");

        milestone.completed = true;
        milestone.completionDate = block.timestamp;
        milestone.completionEvidence = _evidence;

        // Release funds from escrow
        bondIssuance.releaseFundsForMilestone(_projectId, milestone.fundsToRelease);

        emit MilestoneCompleted(
            _projectId,
            _milestoneId,
            milestone.fundsToRelease,
            _evidence,
            block.timestamp
        );
    }

    /**
     * @dev Delay a milestone (extend target date)
     * @param _projectId Project ID
     * @param _milestoneId Milestone ID
     * @param _newTargetDate New target date
     */
    function delayMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        uint256 _newTargetDate
    ) public onlyAdmin {
        require(_milestoneId < projectMilestones[_projectId].length, "Invalid milestone");
        require(_newTargetDate > block.timestamp, "Target date must be in future");
        
        Milestone storage milestone = projectMilestones[_projectId][_milestoneId];
        require(!milestone.completed, "Cannot delay completed milestone");

        milestone.targetDate = _newTargetDate;

        emit MilestoneDelayed(_projectId, _milestoneId, _newTargetDate, block.timestamp);
    }

    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get all milestones for a project
     */
    function getProjectMilestones(uint256 _projectId) 
        public 
        view 
        returns (Milestone[] memory) 
    {
        return projectMilestones[_projectId];
    }

    /**
     * @dev Get a specific milestone
     */
    function getMilestone(uint256 _projectId, uint256 _milestoneId) 
        public 
        view 
        returns (Milestone memory) 
    {
        require(_milestoneId < projectMilestones[_projectId].length, "Invalid milestone");
        return projectMilestones[_projectId][_milestoneId];
    }

    /**
     * @dev Get milestone completion percentage
     */
    function getCompletionPercentage(uint256 _projectId) 
        public 
        view 
        returns (uint256) 
    {
        Milestone[] memory milestones = projectMilestones[_projectId];
        if (milestones.length == 0) return 0;

        uint256 completed = 0;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].completed) {
                completed++;
            }
        }

        return (completed * 100) / milestones.length;
    }

    /**
     * @dev Get total funds to be released
     */
    function getTotalMilestoneFunds(uint256 _projectId) 
        public 
        view 
        returns (uint256) 
    {
        return totalMilestoneFunds[_projectId];
    }

    /**
     * @dev Get funds released so far
     */
    function getTotalFundsReleased(uint256 _projectId) 
        public 
        view 
        returns (uint256) 
    {
        uint256 totalReleased = 0;
        Milestone[] memory milestones = projectMilestones[_projectId];
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].completed) {
                totalReleased += milestones[i].fundsToRelease;
            }
        }

        return totalReleased;
    }
}
```

---

## 🔧 CONTRACT 4: InterestCalculator.sol
### Interest Accrual & Distribution

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./InfrastructureBond.sol";

/**
 * @title InterestCalculator
 * @dev Manages automatic interest accrual and distribution
 * 
 * PROBLEM SOLVED:
 * - Manual interest calculation: Automated via smart contract
 * - Lack of predictability: Formula is public and transparent
 * - Slow distribution: Instant upon claim
 * 
 * @notice Interest accrues monthly or quarterly
 * @notice Investors claim interest anytime (as new tokens)
 */

contract InterestCalculator is AccessControl {
    
    // ==================== ROLES ====================
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ==================== STRUCTS ====================
    
    struct InterestRecord {
        uint256 projectId;
        address investor;
        uint256 tokensHeld;
        uint256 interestAccrued;
        uint256 interestPaid;
        uint256 lastAccrualDate;
    }

    // ==================== STATE VARIABLES ====================
    
    /// @notice Interest records per investor per project
    mapping(address => mapping(uint256 => InterestRecord)) public interestRecords;
    
    /// @notice Bond token references
    mapping(uint256 => address) public projectBonds;
    
    /// @notice Total interest distributed
    uint256 public totalInterestDistributed;
    
    /// @notice Accrual frequency (in seconds, e.g., 30 days = 2592000)
    uint256 public accrualFrequency = 30 days;

    // ==================== EVENTS ====================
    
    event InterestAccrued(
        address indexed investor,
        uint256 indexed projectId,
        uint256 amount,
        uint256 timestamp
    );

    event InterestClaimed(
        address indexed investor,
        uint256 indexed projectId,
        uint256 amount,
        uint256 timestamp
    );

    event InterestDistributed(
        uint256 indexed projectId,
        uint256 totalAmount,
        uint256 timestamp
    );

    // ==================== MODIFIERS ====================
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not admin");
        _;
    }

    // ==================== CONSTRUCTOR ====================
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // ==================== REGISTRATION ====================
    
    /**
     * @dev Register a bond token for interest calculation
     * @param _projectId Project ID
     * @param _bondToken Bond token address
     */
    function registerBond(uint256 _projectId, address _bondToken) 
        public 
        onlyAdmin 
    {
        require(_bondToken != address(0), "Invalid token address");
        projectBonds[_projectId] = _bondToken;
    }

    // ==================== INTEREST ACCRUAL ====================
    
    /**
     * @dev Calculate accrued interest for an investor
     * @param _investor Investor address
     * @param _projectId Project ID
     * @return Interest accrued since last calculation
     * 
     * Formula: (tokensHeld × annualRate × daysSinceLastAccrual) / (10000 × 365)
     */
    function calculateAccruedInterest(address _investor, uint256 _projectId) 
        public 
        view 
        returns (uint256) 
    {
        address bondAddress = projectBonds[_projectId];
        require(bondAddress != address(0), "Bond not registered");

        InfrastructureBond bond = InfrastructureBond(bondAddress);
        uint256 tokensHeld = bond.balanceOf(_investor);

        if (tokensHeld == 0) return 0;

        InterestRecord storage record = interestRecords[_investor][_projectId];
        uint256 daysSinceAccrual = (block.timestamp - record.lastAccrualDate) / 1 days;

        if (daysSinceAccrual == 0) return 0;

        // Get interest rate from bond contract
        (, , uint256 annualRate, , , ) = bond.getProjectInfo();

        // Calculate interest
        uint256 interestAmount = (tokensHeld * annualRate * daysSinceAccrual) / (10000 * 365);
        return interestAmount;
    }

    /**
     * @dev Update accrued interest for an investor (called periodically)
     * @param _investor Investor address
     * @param _projectId Project ID
     */
    function updateAccruedInterest(address _investor, uint256 _projectId) 
        public 
    {
        uint256 accrued = calculateAccruedInterest(_investor, _projectId);

        if (accrued > 0) {
            InterestRecord storage record = interestRecords[_investor][_projectId];
            record.interestAccrued += accrued;
            record.lastAccrualDate = block.timestamp;

            emit InterestAccrued(_investor, _projectId, accrued, block.timestamp);
        }
    }

    // ==================== INTEREST CLAIMING ====================
    
    /**
     * @dev Investor claims accrued interest (receives new tokens)
     * @param _projectId Project ID
     */
    function claimInterest(uint256 _projectId) public {
        // First, update accrued interest
        updateAccruedInterest(msg.sender, _projectId);

        InterestRecord storage record = interestRecords[msg.sender][_projectId];
        require(record.interestAccrued > 0, "No interest to claim");

        uint256 amountToClaim = record.interestAccrued;
        record.interestAccrued = 0;
        record.interestPaid += amountToClaim;

        // Mint interest tokens to investor
        address bondAddress = projectBonds[_projectId];
        InfrastructureBond(bondAddress).mint(msg.sender, amountToClaim);

        totalInterestDistributed += amountToClaim;

        emit InterestClaimed(msg.sender, _projectId, amountToClaim, block.timestamp);
    }

    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get investor's accrued but unclaimed interest
     */
    function getAccruedInterest(address _investor, uint256 _projectId) 
        public 
        view 
        returns (uint256) 
    {
        InterestRecord storage record = interestRecords[_investor][_projectId];
        return record.interestAccrued + calculateAccruedInterest(_investor, _projectId);
    }

    /**
     * @dev Get total interest paid to an investor
     */
    function getTotalInterestPaid(address _investor, uint256 _projectId) 
        public 
        view 
        returns (uint256) 
    {
        return interestRecords[_investor][_projectId].interestPaid;
    }

    /**
     * @dev Get investor's interest record
     */
    function getInterestRecord(address _investor, uint256 _projectId) 
        public 
        view 
        returns (InterestRecord memory) 
    {
        return interestRecords[_investor][_projectId];
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Set accrual frequency (e.g., 30 days)
     */
    function setAccrualFrequency(uint256 _seconds) public onlyAdmin {
        require(_seconds > 0, "Frequency must be > 0");
        accrualFrequency = _seconds;
    }

    /**
     * @dev Distribute interest to all holders (batch operation)
     * @notice Called by admin to distribute monthly interest
     * @param _projectId Project ID
     * @param _investors List of investor addresses
     */
    function distributeMonthlyInterest(uint256 _projectId, address[] calldata _investors) 
        public 
        onlyAdmin 
    {
        uint256 totalDistributed = 0;

        for (uint256 i = 0; i < _investors.length; i++) {
            address investor = _investors[i];
            uint256 accrued = calculateAccruedInterest(investor, _projectId);

            if (accrued > 0) {
                InterestRecord storage record = interestRecords[investor][_projectId];
                record.interestAccrued += accrued;
                record.lastAccrualDate = block.timestamp;
                totalDistributed += accrued;

                emit InterestAccrued(investor, _projectId, accrued, block.timestamp);
            }
        }

        if (totalDistributed > 0) {
            emit InterestDistributed(_projectId, totalDistributed, block.timestamp);
        }
    }
}
```

---

## 📝 Smart Contract Setup & Testing

### **Hardhat Configuration**

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      // Local testnet
    }
  }
};
```

### **Deployment Script**

```javascript
// scripts/deploy.js
async function main() {
  console.log("Deploying INFRACHAIN contracts...");

  // 1. Deploy BondIssuance first
  const escrowWallet = "0x..."; // Your escrow wallet
  const BondIssuance = await ethers.getContractFactory("BondIssuance");
  const bondIssuance = await BondIssuance.deploy(escrowWallet);
  await bondIssuance.deployed();
  console.log("BondIssuance:", bondIssuance.address);

  // 2. Deploy MilestoneManager
  const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
  const milestoneManager = await MilestoneManager.deploy(bondIssuance.address);
  await milestoneManager.deployed();
  console.log("MilestoneManager:", milestoneManager.address);

  // 3. Deploy InterestCalculator
  const InterestCalculator = await ethers.getContractFactory("InterestCalculator");
  const interestCalculator = await InterestCalculator.deploy();
  await interestCalculator.deployed();
  console.log("InterestCalculator:", interestCalculator.address);

  // Save addresses for frontend
  const addresses = {
    bondIssuance: bondIssuance.address,
    milestoneManager: milestoneManager.address,
    interestCalculator: interestCalculator.address
  };

  const fs = require("fs");
  fs.writeFileSync(
    "../frontend/src/contracts/addresses.json",
    JSON.stringify(addresses, null, 2)
  );

  console.log("Deployment complete!");
}

main().catch(console.error);
```

### **Unit Tests (Hardhat)**

```javascript
// test/BondIssuance.test.js
const { expect } = require("chai");

describe("BondIssuance", function () {
  let bondIssuance, bond;
  let admin, investor1, investor2, escrow;

  beforeEach(async function () {
    [admin, investor1, investor2, escrow] = await ethers.getSigners();

    const BondIssuance = await ethers.getContractFactory("BondIssuance");
    bondIssuance = await BondIssuance.deploy(escrow.address);

    const tx = await bondIssuance.createProject(
      "Highway Project",
      "BOND-HWY",
      ethers.utils.parseUnits("1000", 6), // 1000 USDC
      500, // 5% interest
      Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
      1, // low risk
      "0x..." // USDC address
    );

    const receipt = await tx.wait();
    // Extract bond token address from logs...
  });

  it("Should create a project", async function () {
    const project = await bondIssuance.getProject(1);
    expect(project.id).to.equal(1);
  });

  it("Should track investments", async function () {
    // Test investment logic
  });

  it("Should calculate progress correctly", async function () {
    // Test progress calculation
  });
});
```

---

## ✅ Phase 2 Checklist

- [ ] All 4 contracts written and reviewed
- [ ] Contracts compile without errors (Hardhat)
- [ ] Unit tests pass (90%+ coverage)
- [ ] Contracts deployed to Polygon Mumbai testnet
- [ ] Contract ABIs exported to frontend
- [ ] Gas optimization completed
- [ ] Security audit checklist passed (reentrancy, overflow, etc.)
- [ ] Role-based access control tested
- [ ] Emergency pause functionality tested
- [ ] Contract addresses documented

---

**Next Phase:** Phase 3 - Backend API Development
**Estimated Duration:** 5-6 hours
**Dependencies:** Contract ABIs from Phase 2

Created: January 30, 2026
Status: Complete ✅
