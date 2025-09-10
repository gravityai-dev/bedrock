/**
 * Shared platform dependencies for all Bedrock services
 */
import { getPlatformDependencies } from "@gravityai-dev/plugin-base";

// Get platform dependencies once
const deps = getPlatformDependencies();

export const getNodeCredentials = deps.getNodeCredentials;
export const saveTokenUsage = deps.saveTokenUsage;
export const createLogger = deps.createLogger;
export const getConfig = deps.getConfig;

// Create shared loggers
export const bedrockLogger = createLogger("Bedrock");
export const bedrockClaudeLogger = createLogger("BedrockClaude");
export const bedrockEmbeddingLogger = createLogger("BedrockEmbedding");
export const bedrockServiceLogger = createLogger("BedrockService");
