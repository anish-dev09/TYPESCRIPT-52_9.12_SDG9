const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/blockchain/project/:projectId
 * @desc    Get project details from blockchain
 * @access  Public
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await blockchainService.getProject(projectId);
    res.json({ project });
  } catch (error) {
    console.error('Blockchain project fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch project from blockchain' });
  }
});

/**
 * @route   GET /api/blockchain/balance/:address
 * @desc    Get token balance for wallet address
 * @access  Public
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await blockchainService.getTokenBalance(address);
    res.json({ balance, address });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * @route   GET /api/blockchain/investment/:address/:projectId
 * @desc    Get user investment in a project from blockchain
 * @access  Public
 */
router.get('/investment/:address/:projectId', async (req, res) => {
  try {
    const { address, projectId } = req.params;
    const investment = await blockchainService.getUserInvestment(address, projectId);
    res.json({ investment, address, projectId });
  } catch (error) {
    console.error('Investment fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
});

/**
 * @route   GET /api/blockchain/interest/:address/:projectId
 * @desc    Get accrued interest for investor
 * @access  Public
 */
router.get('/interest/:address/:projectId', async (req, res) => {
  try {
    const { address, projectId } = req.params;
    const interest = await blockchainService.getAccruedInterest(address, projectId);
    res.json({ interest, address, projectId });
  } catch (error) {
    console.error('Interest calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate interest' });
  }
});

/**
 * @route   GET /api/blockchain/transaction/:txHash
 * @desc    Get transaction receipt and status
 * @access  Public
 */
router.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const status = await blockchainService.verifyTransaction(txHash);
    res.json({ transactionHash: txHash, ...status });
  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

/**
 * @route   GET /api/blockchain/block
 * @desc    Get current block number
 * @access  Public
 */
router.get('/block', async (req, res) => {
  try {
    const blockNumber = await blockchainService.getCurrentBlock();
    res.json({ blockNumber });
  } catch (error) {
    console.error('Block number fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch block number' });
  }
});

module.exports = router;
