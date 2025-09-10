/**
 * AWS Bedrock client management
 * Handles client initialization and caching
 */
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { getPlatformDependencies } from "@gravityai-dev/plugin-base";

// Client cache to avoid recreating clients for the same credentials
const clientCache = new Map<string, { client: BedrockRuntimeClient; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * AWS Credentials interface - kept for backward compatibility
 * New code should use CredentialContext instead
 */
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

/**
 * Get cache key for credential context
 */
function getCacheKey(context: any): string {
  return `${context.nodeId}_${context.nodeType}_${context.executionId}`;
}

/**
 * Initialize AWS Bedrock client with credentials from context (with caching)
 */
export async function initializeBedrockClient(context: any): Promise<BedrockRuntimeClient> {
  const { createLogger, getNodeCredentials } = getPlatformDependencies();
  const logger = createLogger("BedrockService");
  
  const cacheKey = getCacheKey(context);
  const cached = clientCache.get(cacheKey);

  // Return cached client if it exists and hasn't expired
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug("Using cached Bedrock client", { cacheKey });
    return cached.client;
  }

  const credentials = await getNodeCredentials(context, "awsCredential");

  if (!credentials) {
    throw new Error("AWS credentials not found");
  }

  const client = new BedrockRuntimeClient({
    region: credentials.region || "us-east-1",
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  });

  // Cache the client
  clientCache.set(cacheKey, { client, timestamp: Date.now() });
  logger.debug("Created and cached new Bedrock client", { cacheKey });

  return client;
}

/**
 * Initialize AWS Bedrock client with direct credentials
 */
export function initializeBedrockClientWithCredentials(credentials: AWSCredentials): BedrockRuntimeClient {
  return new BedrockRuntimeClient({
    region: credentials.region || "us-east-1",
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  });
}

/**
 * Clean up expired clients from cache
 */
export function cleanupClientCache(): void {
  const now = Date.now();
  for (const [key, value] of clientCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      clientCache.delete(key);
    }
  }
}
