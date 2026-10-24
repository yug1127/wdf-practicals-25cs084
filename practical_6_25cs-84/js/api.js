/**
 * Modular JS: API Module
 * Responsible for fetching JSON datasets, latency simulation, error handling, and caching.
 * Practical 6 - Yug Patel (25CS084)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PortalAPI = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // In-memory cache for fetched datasets
  const cache = new Map();

  // Configuration options
  const config = {
    simulateLatency: true,
    latencyMs: 400,
    simulateError: false
  };

  /**
   * URLs for each dataset.
   * We test both './data/[dataset].json' and './[dataset].json'
   */
  const DATASET_URLS = {
    events: ['./events.json', './data/events.json'],
    students: ['./students.json', './data/students.json'],
    faqs: ['./faqs.json', './data/faqs.json']
  };

  /**
   * Delay helper for latency simulation
   * @param {number} ms 
   */
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Fetches a JSON dataset using the Fetch API with async/await
   * @param {'events' | 'students' | 'faqs'} datasetKey 
   * @param {boolean} forceRefresh 
   * @returns {Promise<Array<Object>>}
   */
  async function fetchDataset(datasetKey, forceRefresh = false) {
    // 1. Check for intentional error simulation
    if (config.simulateError) {
      if (config.simulateLatency) await sleep(config.latencyMs);
      throw new Error(`[Simulated Network Error]: Failed to fetch ${datasetKey}.json. Server responded with 500 Internal Server Error.`);
    }

    // 2. Return cached copy if available and not forced
    if (!forceRefresh && cache.has(datasetKey)) {
      if (config.simulateLatency) await sleep(config.latencyMs / 2);
      return cache.get(datasetKey);
    }

    // 3. Attempt to fetch using Fetch API
    const urls = DATASET_URLS[datasetKey] || [`./${datasetKey}.json`];
    let lastError = null;

    if (config.simulateLatency) {
      await sleep(config.latencyMs);
    }

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          },
          cache: forceRefresh ? 'no-cache' : 'default'
        });

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText} while fetching ${url}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error(`Invalid data format: Expected an Array of records, received ${typeof data}`);
        }

        // Cache the parsed data
        cache.set(datasetKey, data);
        return data;
      } catch (err) {
        lastError = err;
        // Continue to fallback URL if first fails
      }
    }

    // If fetch failed across all candidate paths
    throw lastError || new Error(`Unable to fetch dataset "${datasetKey}" via Fetch API.`);
  }

  /**
   * Clears the API cache
   * @param {string} [datasetKey] - Optional specific dataset to clear
   */
  function clearCache(datasetKey) {
    if (datasetKey) {
      cache.delete(datasetKey);
    } else {
      cache.clear();
    }
  }

  /**
   * Set latency simulation
   * @param {boolean} enabled 
   * @param {number} [ms]
   */
  function setLatency(enabled, ms = 400) {
    config.simulateLatency = !!enabled;
    config.latencyMs = ms;
  }

  /**
   * Set error simulation
   * @param {boolean} enabled 
   */
  function setSimulateError(enabled) {
    config.simulateError = !!enabled;
  }

  /**
   * Check current configuration
   */
  function getConfig() {
    return { ...config };
  }

  return {
    fetchDataset,
    clearCache,
    setLatency,
    setSimulateError,
    getConfig
  };
});
