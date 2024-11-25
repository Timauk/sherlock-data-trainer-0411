// Browser-compatible cache implementation
class BrowserCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxKeys = options.maxKeys || 1000;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key, value, ttl) {
    if (this.cache.size >= this.maxKeys) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expires: ttl ? Date.now() + (ttl * 1000) : null
    });
  }

  flushAll() {
    this.cache.clear();
  }

  getStats() {
    return {
      keys: this.cache.size,
      ksize: this.cache.size,
      vsize: this.cache.size
    };
  }
}

const cache = new BrowserCache({ maxKeys: 1000 });

// Monitor cache usage
setInterval(() => {
  const stats = cache.getStats();
  console.log('📊 Cache Stats:', stats);
  
  if (stats.keys > 800) {
    console.warn('⚠️ Cache reaching capacity, cleaning old entries');
    cache.flushAll();
  }
}, 300000); // Every 5 minutes

export const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log('🎯 Cache Hit:', key);
    return res.send(cachedResponse);
  }

  console.log('❌ Cache Miss:', key);
  res.sendResponse = res.send;
  res.send = (body) => {
    if (JSON.stringify(body).length < 50000) {
      cache.set(key, body);
      console.log('💾 Cache Stored:', key);
    } else {
      console.log('⚠️ Response too large to cache:', key);
    }
    res.sendResponse(body);
  };
  next();
};

export const clearCache = () => {
  cache.flushAll();
  console.log('🧹 Cache limpo manualmente');
};