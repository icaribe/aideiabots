
import { useState, useEffect } from "react";
import { LLMModel } from "@/types/provider";

interface CacheEntry {
  models: LLMModel[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const modelCache = new Map<string, CacheEntry>();

export const useModelCache = () => {
  const getCachedModels = (cacheKey: string): LLMModel[] | null => {
    const entry = modelCache.get(cacheKey);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      modelCache.delete(cacheKey);
      return null;
    }
    
    return entry.models;
  };

  const setCachedModels = (cacheKey: string, models: LLMModel[]) => {
    const now = Date.now();
    modelCache.set(cacheKey, {
      models,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    });
  };

  const clearCache = () => {
    modelCache.clear();
  };

  return {
    getCachedModels,
    setCachedModels,
    clearCache
  };
};
