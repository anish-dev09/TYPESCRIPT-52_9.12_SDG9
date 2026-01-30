import { ethers } from 'ethers';

/**
 * Token Service - Utility functions for token calculations and formatting
 */

/**
 * Convert token amount to display format
 * @param amount - Raw token amount
 * @param decimals - Token decimals (default 18)
 * @returns Formatted string
 */
export const formatTokenAmount = (amount: string | number, decimals: number = 18): string => {
  try {
    const parsed = ethers.formatUnits(amount.toString(), decimals);
    return parseFloat(parsed).toFixed(2);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0.00';
  }
};

/**
 * Parse user input to token amount
 * @param input - User input string
 * @param decimals - Token decimals (default 18)
 * @returns BigNumber token amount
 */
export const parseTokenAmount = (input: string, decimals: number = 18): string => {
  try {
    return ethers.parseUnits(input, decimals).toString();
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return '0';
  }
};

/**
 * Calculate interest earned on tokens
 * @param tokenAmount - Amount of tokens held
 * @param annualRate - Annual interest rate (percentage)
 * @param durationDays - Duration in days
 * @returns Interest amount
 */
export const calculateInterest = (
  tokenAmount: number,
  annualRate: number,
  durationDays: number
): number => {
  const dailyRate = annualRate / 365 / 100;
  return tokenAmount * dailyRate * durationDays;
};

/**
 * Calculate monthly interest
 * @param tokenAmount - Amount of tokens held
 * @param annualRate - Annual interest rate (percentage)
 * @returns Monthly interest amount
 */
export const calculateMonthlyInterest = (
  tokenAmount: number,
  annualRate: number
): number => {
  return calculateInterest(tokenAmount, annualRate, 30);
};

/**
 * Calculate total investment value with interest
 * @param principal - Initial investment
 * @param annualRate - Annual interest rate (percentage)
 * @param durationDays - Duration in days
 * @returns Total value
 */
export const calculateTotalValue = (
  principal: number,
  annualRate: number,
  durationDays: number
): number => {
  const interest = calculateInterest(principal, annualRate, durationDays);
  return principal + interest;
};

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency symbol (default ₹)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Calculate token price based on bond value
 * @param totalBondValue - Total value of the bond
 * @param totalTokens - Total tokens issued
 * @returns Price per token
 */
export const calculateTokenPrice = (
  totalBondValue: number,
  totalTokens: number
): number => {
  if (totalTokens === 0) return 0;
  return totalBondValue / totalTokens;
};

/**
 * Calculate number of tokens for given investment
 * @param investmentAmount - Amount to invest
 * @param tokenPrice - Price per token
 * @returns Number of tokens
 */
export const calculateTokensForInvestment = (
  investmentAmount: number,
  tokenPrice: number
): number => {
  if (tokenPrice === 0) return 0;
  return investmentAmount / tokenPrice;
};

/**
 * Calculate investment amount for given tokens
 * @param tokenAmount - Number of tokens
 * @param tokenPrice - Price per token
 * @returns Investment amount
 */
export const calculateInvestmentForTokens = (
  tokenAmount: number,
  tokenPrice: number
): number => {
  return tokenAmount * tokenPrice;
};

/**
 * Calculate percentage of target raised
 * @param raised - Amount raised so far
 * @param target - Target amount
 * @returns Percentage (0-100)
 */
export const calculateProgressPercentage = (
  raised: number,
  target: number
): number => {
  if (target === 0) return 0;
  return Math.min((raised / target) * 100, 100);
};

/**
 * Calculate ROI (Return on Investment)
 * @param currentValue - Current value of investment
 * @param initialInvestment - Initial investment amount
 * @returns ROI percentage
 */
export const calculateROI = (
  currentValue: number,
  initialInvestment: number
): number => {
  if (initialInvestment === 0) return 0;
  return ((currentValue - initialInvestment) / initialInvestment) * 100;
};

/**
 * Format percentage
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate time remaining
 * @param targetDate - Target date string
 * @returns Object with days, hours, minutes
 */
export const calculateTimeRemaining = (targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
} => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isPast: false };
};

/**
 * Validate investment amount
 * @param amount - Amount to validate
 * @param min - Minimum allowed
 * @param max - Maximum allowed
 * @returns Validation result
 */
export const validateInvestmentAmount = (
  amount: number,
  min: number = 100,
  max?: number
): { valid: boolean; error?: string } => {
  if (amount < min) {
    return { valid: false, error: `Minimum investment is ${formatCurrency(min)}` };
  }
  if (max && amount > max) {
    return { valid: false, error: `Maximum investment is ${formatCurrency(max)}` };
  }
  return { valid: true };
};

/**
 * Get risk level color
 * @param risk - Risk level (low, medium, high)
 * @returns Tailwind color class
 */
export const getRiskColor = (risk: string): string => {
  switch (risk.toLowerCase()) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get status color
 * @param status - Project status
 * @returns Tailwind color class
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const tokenService = {
  formatTokenAmount,
  parseTokenAmount,
  calculateInterest,
  calculateMonthlyInterest,
  calculateTotalValue,
  formatCurrency,
  calculateTokenPrice,
  calculateTokensForInvestment,
  calculateInvestmentForTokens,
  calculateProgressPercentage,
  calculateROI,
  formatPercentage,
  calculateTimeRemaining,
  validateInvestmentAmount,
  getRiskColor,
  getStatusColor,
};

export default tokenService;
