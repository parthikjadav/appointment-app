const {LRUCache} = require('lru-cache');

const cache = new LRUCache({
    max: 1000, // Maximum number of items in the cache
    ttl: 1000 * 60 * 60, // Time to live for each item in milliseconds (1 hour)
    updateAgeOnGet: true, // Update the age of the item on get
})

module.exports = cache;