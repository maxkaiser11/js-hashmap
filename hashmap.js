class HashMap {
  constructor(loadFactor = 0.75, capacity = 16) {
    this.loadFactor = loadFactor;
    this.initialCapacity = capacity;
    this.capacity = capacity;
    this.size = 0;
    this.buckets = this.#createBuckets(capacity);
  }

  // Each bucket is an array of [key, value] pairs (separate chaining).
  #createBuckets(capacity) {
    return Array.from({ length: capacity }, () => []);
  }

  // Turns a string key into a bucket index in [0, capacity).
  // Modulo on every iteration keeps the number small, so long keys
  // never exceed Number.MAX_SAFE_INTEGER.
  hash(key) {
    let hashCode = 0;
    const primeNumber = 31;
    for (let i = 0; i < key.length; i++) {
      hashCode = (primeNumber * hashCode + key.charCodeAt(i)) % this.capacity;
    }
    return hashCode;
  }

  #bucketFor(key) {
    const index = this.hash(key);
    if (index < 0 || index >= this.buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }
    return this.buckets[index];
  }

  set(key, value) {
    const bucket = this.#bucketFor(key);

    // Same key already present? Overwrite: no new entry, no growth.
    for (const entry of bucket) {
      if (entry[0] === key) {
        entry[1] = value;
        return;
      }
    }

    // New key (possibly a collision with other keys in this bucket).
    bucket.push([key, value]);
    this.size++;

    if (this.size / this.capacity > this.loadFactor) {
      this.#grow();
    }
  }

  // Double the capacity and re-insert everything, because each key's
  // index depends on capacity and will change.
  #grow() {
    const oldEntries = this.entries();
    this.capacity *= 2;
    this.buckets = this.#createBuckets(this.capacity);
    for (const [key, value] of oldEntries) {
      this.#bucketFor(key).push([key, value]);
    }
    // size is unchanged: same entries, just redistributed.
  }

  get(key) {
    const bucket = this.#bucketFor(key);
    for (const [k, v] of bucket) {
      if (k === key) return v;
    }
    return undefined;
  }

  has(key) {
    const bucket = this.#bucketFor(key);
    return bucket.some(([k]) => k === key);
  }

  remove(key) {
    const bucket = this.#bucketFor(key);
    const i = bucket.findIndex(([k]) => k === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.size--;
    return true;
  }

  length() {
    return this.size;
  }

  clear() {
    this.capacity = this.initialCapacity;
    this.buckets = this.#createBuckets(this.capacity);
    this.size = 0;
  }

  keys() {
    return this.entries().map(([k]) => k);
  }

  values() {
    return this.entries().map(([, v]) => v);
  }

  entries() {
    const result = [];
    for (const bucket of this.buckets) {
      for (const [k, v] of bucket) result.push([k, v]);
    }
    return result;
  }

  // Debug helper: how many entries sit in each bucket.
  distribution() {
    return this.buckets.map((b) => b.length);
  }
}

// Extra credit: same idea, keys only.
class HashSet {
  constructor(loadFactor = 0.75, capacity = 16) {
    this.loadFactor = loadFactor;
    this.initialCapacity = capacity;
    this.capacity = capacity;
    this.size = 0;
    this.buckets = this.#createBuckets(capacity);
  }

  #createBuckets(capacity) {
    return Array.from({ length: capacity }, () => []);
  }

  hash(key) {
    let hashCode = 0;
    for (let i = 0; i < key.length; i++) {
      hashCode = (31 * hashCode + key.charCodeAt(i)) % this.capacity;
    }
    return hashCode;
  }

  #bucketFor(key) {
    const index = this.hash(key);
    if (index < 0 || index >= this.buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }
    return this.buckets[index];
  }

  add(key) {
    const bucket = this.#bucketFor(key);
    if (bucket.includes(key)) return;
    bucket.push(key);
    this.size++;
    if (this.size / this.capacity > this.loadFactor) this.#grow();
  }

  #grow() {
    const old = this.keys();
    this.capacity *= 2;
    this.buckets = this.#createBuckets(this.capacity);
    for (const key of old) this.#bucketFor(key).push(key);
  }

  has(key) {
    return this.#bucketFor(key).includes(key);
  }

  remove(key) {
    const bucket = this.#bucketFor(key);
    const i = bucket.indexOf(key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.size--;
    return true;
  }

  length() {
    return this.size;
  }

  clear() {
    this.capacity = this.initialCapacity;
    this.buckets = this.#createBuckets(this.capacity);
    this.size = 0;
  }

  keys() {
    return this.buckets.flat();
  }
}

module.exports = { HashMap, HashSet };