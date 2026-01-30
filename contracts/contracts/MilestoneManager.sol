// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BondIssuance.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MilestoneManager
 * @dev Manages project milestones and conditional fund release
 * 
 * PROBLEM SOLVED: Fund misuse and lack of accountability
 * SOLUTION: Milestone-gated fund release with verification
 * 
 * Key Features:
 * - Milestone creation and tracking
 * - Evidence-based completion verification
 * - Conditional fund release
 * - Transparency logs
 */
contract MilestoneManager is AccessControl, ReentrancyGuard {
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Bond issuance contract
    BondIssuance public bondIssuance;
    
    // Milestone status enum
    enum MilestoneStatus { Pending, InProgress, Completed, Delayed, Failed }
    
    // Milestone structure
    struct Milestone {
        uint256 id;
        uint256 projectId;
        string name;
        string description;
        uint256 targetDate;
        uint256 fundsToRelease;
        MilestoneStatus status;
        uint256 completedDate;
        string evidenceHash; // IPFS hash of completion evidence
        address verifiedBy;
    }
    
    // Storage
    mapping(uint256 => Milestone[]) public projectMilestones; // projectId => milestones
    mapping(uint256 => mapping(uint256 => bool)) public milestoneExists; // projectId => milestoneIndex => exists
    
    uint256 public totalMilestones;
    
    // Events
    event MilestoneCreated(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        string name,
        uint256 fundsToRelease
    );
    event MilestoneStatusUpdated(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        MilestoneStatus status
    );
    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        uint256 fundsReleased,
        string evidenceHash
    );
    event MilestoneFailed(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        string reason
    );
    
    constructor(address _bondIssuance) {
        require(_bondIssuance != address(0), "Invalid bond issuance address");
        bondIssuance = BondIssuance(_bondIssuance);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new milestone for a project
     */
    function createMilestone(
        uint256 projectId,
        string memory name,
        string memory description,
        uint256 targetDate,
        uint256 fundsToRelease
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(bytes(name).length > 0, "Milestone name required");
        require(targetDate > block.timestamp, "Target date must be in future");
        require(fundsToRelease > 0, "Funds to release must be greater than zero");
        
        // Validate project exists and has sufficient escrow
        uint256 escrowBalance = bondIssuance.getEscrowBalance(projectId);
        
        // Calculate total pending milestones funds
        uint256 totalPendingFunds = 0;
        Milestone[] storage milestones = projectMilestones[projectId];
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status != MilestoneStatus.Completed) {
                totalPendingFunds += milestones[i].fundsToRelease;
            }
        }
        
        require(
            totalPendingFunds + fundsToRelease <= escrowBalance,
            "Insufficient escrow for milestone"
        );
        
        uint256 milestoneIndex = projectMilestones[projectId].length;
        
        projectMilestones[projectId].push(Milestone({
            id: totalMilestones,
            projectId: projectId,
            name: name,
            description: description,
            targetDate: targetDate,
            fundsToRelease: fundsToRelease,
            status: MilestoneStatus.Pending,
            completedDate: 0,
            evidenceHash: "",
            verifiedBy: address(0)
        }));
        
        milestoneExists[projectId][milestoneIndex] = true;
        totalMilestones++;
        
        emit MilestoneCreated(projectId, milestoneIndex, name, fundsToRelease);
        return milestoneIndex;
    }
    
    /**
     * @dev Update milestone status
     */
    function updateMilestoneStatus(
        uint256 projectId,
        uint256 milestoneIndex,
        MilestoneStatus status
    ) external onlyRole(VERIFIER_ROLE) {
        require(
            milestoneExists[projectId][milestoneIndex],
            "Milestone does not exist"
        );
        
        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        require(
            milestone.status != MilestoneStatus.Completed,
            "Milestone already completed"
        );
        
        milestone.status = status;
        
        emit MilestoneStatusUpdated(projectId, milestoneIndex, status);
    }
    
    /**
     * @dev Complete a milestone and release funds
     */
    function completeMilestone(
        uint256 projectId,
        uint256 milestoneIndex,
        string memory evidenceHash
    ) external onlyRole(VERIFIER_ROLE) nonReentrant {
        require(
            milestoneExists[projectId][milestoneIndex],
            "Milestone does not exist"
        );
        require(bytes(evidenceHash).length > 0, "Evidence hash required");
        
        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        require(
            milestone.status != MilestoneStatus.Completed,
            "Milestone already completed"
        );
        require(
            milestone.status != MilestoneStatus.Failed,
            "Cannot complete failed milestone"
        );
        
        // Update milestone
        milestone.status = MilestoneStatus.Completed;
        milestone.completedDate = block.timestamp;
        milestone.evidenceHash = evidenceHash;
        milestone.verifiedBy = msg.sender;
        
        // Release funds from escrow
        bondIssuance.releaseFunds(projectId, milestone.fundsToRelease);
        
        emit MilestoneCompleted(
            projectId,
            milestoneIndex,
            milestone.fundsToRelease,
            evidenceHash
        );
    }
    
    /**
     * @dev Mark milestone as failed
     */
    function failMilestone(
        uint256 projectId,
        uint256 milestoneIndex,
        string memory reason
    ) external onlyRole(ADMIN_ROLE) {
        require(
            milestoneExists[projectId][milestoneIndex],
            "Milestone does not exist"
        );
        
        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        require(
            milestone.status != MilestoneStatus.Completed,
            "Cannot fail completed milestone"
        );
        
        milestone.status = MilestoneStatus.Failed;
        
        emit MilestoneFailed(projectId, milestoneIndex, reason);
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 projectId, uint256 milestoneIndex)
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 targetDate,
            uint256 fundsToRelease,
            MilestoneStatus status,
            uint256 completedDate,
            string memory evidenceHash
        )
    {
        require(
            milestoneExists[projectId][milestoneIndex],
            "Milestone does not exist"
        );
        
        Milestone memory milestone = projectMilestones[projectId][milestoneIndex];
        return (
            milestone.name,
            milestone.description,
            milestone.targetDate,
            milestone.fundsToRelease,
            milestone.status,
            milestone.completedDate,
            milestone.evidenceHash
        );
    }
    
    /**
     * @dev Get all milestones for a project
     */
    function getProjectMilestones(uint256 projectId)
        external
        view
        returns (Milestone[] memory)
    {
        return projectMilestones[projectId];
    }
    
    /**
     * @dev Get milestone count for a project
     */
    function getMilestoneCount(uint256 projectId)
        external
        view
        returns (uint256)
    {
        return projectMilestones[projectId].length;
    }
    
    /**
     * @dev Get project completion percentage
     */
    function getCompletionPercentage(uint256 projectId)
        external
        view
        returns (uint256)
    {
        Milestone[] memory milestones = projectMilestones[projectId];
        if (milestones.length == 0) return 0;
        
        uint256 completed = 0;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status == MilestoneStatus.Completed) {
                completed++;
            }
        }
        
        return (completed * 100) / milestones.length;
    }
    
    /**
     * @dev Check if milestone is overdue
     */
    function isMilestoneOverdue(uint256 projectId, uint256 milestoneIndex)
        external
        view
        returns (bool)
    {
        require(
            milestoneExists[projectId][milestoneIndex],
            "Milestone does not exist"
        );
        
        Milestone memory milestone = projectMilestones[projectId][milestoneIndex];
        return (
            milestone.status != MilestoneStatus.Completed &&
            block.timestamp > milestone.targetDate
        );
    }
    
    /**
     * @dev Get total funds pending release for a project
     */
    function getPendingFunds(uint256 projectId)
        external
        view
        returns (uint256)
    {
        Milestone[] memory milestones = projectMilestones[projectId];
        uint256 pending = 0;
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status != MilestoneStatus.Completed) {
                pending += milestones[i].fundsToRelease;
            }
        }
        
        return pending;
    }
}
